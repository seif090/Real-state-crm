import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createLead, listLeads } from "@/lib/crm-service";

export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  }

  const lead = await createLead({
    name: body.name,
    phone: body.phone,
    email: body.email,
    status: body.status,
    score: body.score,
    source: body.source,
    budget: Number(body.budget) || undefined,
    preferredLocation: body.preferredLocation,
    propertyId: body.propertyId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/assistant");

  return NextResponse.json({ lead }, { status: 201 });
}
