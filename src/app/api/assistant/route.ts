import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";
import { getLeadSummary, listProperties } from "@/lib/crm-service";

type AssistantRequest = {
  message?: string;
  leadId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AssistantRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const leadSummary = body.leadId ? await getLeadSummary(body.leadId) : null;
  const properties = await listProperties();
  const aiResponse = await generateAIResponse(
    message,
    properties.map((property) => ({
      id: property.id,
      name: property.name,
      location: property.location,
      price: property.price,
      area: property.area,
    }))
  );

  return NextResponse.json({
    ...aiResponse,
    lead: leadSummary?.lead ?? null,
    conversation: leadSummary,
    rankedProperties: leadSummary?.matchSuggestions ?? [],
  });
}
