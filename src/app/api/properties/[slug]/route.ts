import { NextResponse } from "next/server";
import { getPropertyBySlug, parsePropertyId } from "@/lib/property-details";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const propertyId = parsePropertyId(slug);
  if (!propertyId) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  }
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ propertyId, property }, { status: 200 });
}
