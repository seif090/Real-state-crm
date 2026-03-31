import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { leads as seedLeads, properties } from "@/lib/crm-data";
import type { Lead } from "@/lib/crm-data";

type StoredMessage = {
  leadId: string;
  content: string;
  isIncoming: boolean;
  createdAt: string;
};

type Store = {
  leads: Lead[];
  messages: StoredMessage[];
};

const globalStore = globalThis as typeof globalThis & { crmStore?: Store };

function getStore() {
  if (!globalStore.crmStore) {
    globalStore.crmStore = {
      leads: [...seedLeads],
      messages: [],
    };
  }

  return globalStore.crmStore;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "crm_verify_token";

  if (mode && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (
    body.object === "whatsapp_business_account" &&
    body.entry?.[0]?.changes?.[0]?.value?.messages
  ) {
    const msg = body.entry[0].changes[0].value.messages[0];
    const from = msg.from as string;
    const text = msg.text?.body as string | undefined;

    if (!text) {
      return NextResponse.json({ status: "ignored" });
    }

    console.log(`Received message from ${from}: ${text}`);

    try {
      const store = getStore();
      let lead = store.leads.find((item) => item.phone === from);

      if (!lead) {
        lead = {
          id: `lead-${Date.now()}`,
          phone: from,
          name: "WhatsApp Contact",
          status: "NEW",
          score: "COLD",
          source: "WHATSAPP",
          budget: 0,
          preferredLocation: "Unknown",
          lastTouch: new Date().toISOString(),
          nextFollowUp: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          notesCount: 0,
          messagesCount: 0,
        };

        store.leads.push(lead);
      }

      const aiResponse = await generateAIResponse(text, properties);

      store.messages.push({
        leadId: lead.id,
        content: text,
        isIncoming: true,
        createdAt: new Date().toISOString(),
      });

      lead.score = aiResponse.score ?? lead.score;
      lead.lastTouch = new Date().toISOString();
      lead.messagesCount += 1;

      return NextResponse.json({
        status: "success",
        leadId: lead.id,
        score: lead.score,
        suggestion: aiResponse.text,
      });
    } catch (error) {
      console.error("Error processing WhatsApp message:", error);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "not found" }, { status: 404 });
}
