import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import {
  getPropertyFitScore,
  leads,
  properties,
  type Lead,
} from "@/lib/crm-data";

type AssistantRequest = {
  message?: string;
  leadId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AssistantRequest;
  const message = body.message?.trim();
  const lead = body.leadId ? leads.find((item) => item.id === body.leadId) : undefined;

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const aiResponse = await generateAIResponse(message, properties);
  const rankedProperties = rankProperties(lead);

  return NextResponse.json({
    ...aiResponse,
    lead,
    rankedProperties,
  });
}

function rankProperties(lead?: Lead) {
  return [...properties]
    .map((property) => ({
      ...property,
      fitScore: lead ? getPropertyFitScore(lead, property) : 50,
    }))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);
}
