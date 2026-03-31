import { NextResponse } from "next/server";
import { listLeads } from "@/lib/crm-service";

export async function GET() {
  const leads = await listLeads();
  const threads = leads
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      score: lead.score,
      status: lead.status,
      latestMessage: lead.latestMessage,
      latestMessageAt: lead.latestMessageAt,
      unreadCount: lead.unreadCount || 0,
      assignedProperty: lead.assignedProperty,
    }))
    .sort((a, b) => {
      const aTime = a.latestMessageAt ? Date.parse(a.latestMessageAt) : 0;
      const bTime = b.latestMessageAt ? Date.parse(b.latestMessageAt) : 0;
      return bTime - aTime;
    });

  return NextResponse.json({ threads });
}
