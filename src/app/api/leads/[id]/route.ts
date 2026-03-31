import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateLead } from "@/lib/crm-service";

export async function PATCH(request: Request, context: RouteContext<"/api/leads/[id]">) {
  const { id } = await context.params;
  const body = await request.json();

  const lead = await updateLead(id, {
    name: body.name,
    phone: body.phone,
    email: body.email,
    status: body.status,
    score: body.score,
    source: body.source,
    budget: body.budget !== undefined ? Number(body.budget) : undefined,
    preferredLocation: body.preferredLocation,
    propertyId: body.propertyId ?? undefined,
    agentId: body.agentId ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/assistant");

  return NextResponse.json({ lead });
}
