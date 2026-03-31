import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { appendMessage, listProperties, updateLead, upsertWhatsAppLead } from "@/lib/crm-service";

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
    const from = String(msg.from || "");
    const text = String(msg.text?.body || "").trim();

    if (!from || !text) {
      return NextResponse.json({ status: "ignored" });
    }

    try {
      const lead = await upsertWhatsAppLead(from);
      const properties = await listProperties();
      const aiResponse = await generateAIResponse(
        text,
        properties.map((property) => ({
          id: property.id,
          name: property.name,
          location: property.location,
          price: property.price,
          area: property.area,
        }))
      );

      await appendMessage(lead.id, {
        content: text,
        isIncoming: true,
      });

      if (aiResponse.score) {
        await updateLead(lead.id, { score: aiResponse.score });
      }

      return NextResponse.json({
        status: "success",
        leadId: lead.id,
        score: aiResponse.score,
        suggestion: aiResponse.text,
      });
    } catch (error) {
      console.error("Error processing WhatsApp message:", error);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "not found" }, { status: 404 });
}
