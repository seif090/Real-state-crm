import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  appendMessage,
  getLeadConversation,
  getLeadSummary,
} from "@/lib/crm-service";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/inbox/[leadId]">
) {
  const { leadId } = await context.params;
  const summary = await getLeadSummary(leadId);

  if (!summary) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(summary);
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/inbox/[leadId]">
) {
  const { leadId } = await context.params;
  const body = await request.json();
  const content = String(body.content || "").trim();

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const message = await appendMessage(leadId, {
    content,
    isIncoming: Boolean(body.isIncoming),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard/assistant");

  const conversation = await getLeadConversation(leadId);

  return NextResponse.json({
    message,
    conversation,
  });
}
