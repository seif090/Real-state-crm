import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createProperty, listProperties } from "@/lib/crm-service";

export async function GET() {
  const properties = await listProperties();
  return NextResponse.json({ properties });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name || !body?.location || !body?.type) {
    return NextResponse.json(
      { error: "name, location, and type are required" },
      { status: 400 }
    );
  }

  const property = await createProperty({
    name: body.name,
    location: body.location,
    type: body.type,
    price: Number(body.price) || 0,
    area: Number(body.area) || 0,
    bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : undefined,
    bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : undefined,
    description: body.description,
    status: body.status,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/assistant");

  return NextResponse.json({ property }, { status: 201 });
}
