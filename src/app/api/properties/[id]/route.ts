import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateProperty } from "@/lib/crm-service";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/properties/[id]">
) {
  const { id } = await context.params;
  const body = await request.json();

  const property = await updateProperty(id, {
    name: body.name,
    location: body.location,
    type: body.type,
    price: body.price !== undefined ? Number(body.price) : undefined,
    area: body.area !== undefined ? Number(body.area) : undefined,
    bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : undefined,
    bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : undefined,
    description: body.description,
    status: body.status,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/assistant");

  return NextResponse.json({ property });
}
