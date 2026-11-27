import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Property, PropertyStatus } from "@/lib/properties";

const publicStatuses: PropertyStatus[] = ["available", "reserved", "sold"];

function mapProperty(row: Prisma.PropertyGetPayload<object>): Property {
  if (row.type !== "Casa" && row.type !== "Departamento") {
    throw new Error(`Unsupported property type "${row.type}" for ${row.slug}.`);
  }

  const firstPhoto = Array.isArray(row.photos)
    ? row.photos.find(
        (photo): photo is Prisma.JsonObject =>
          photo !== null && typeof photo === "object" && !Array.isArray(photo),
      )
    : undefined;
  const image = firstPhoto?.src;
  const imageAlt = firstPhoto?.alt;
  if (typeof image !== "string" || typeof imageAlt !== "string") {
    throw new Error(`Property ${row.slug} has no valid primary photo.`);
  }

  return {
    id: row.id,
    publicCode: row.publicCode,
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    price: Number(row.priceMxn),
    zone: row.municipality,
    neighborhood: row.neighborhood,
    bedrooms: row.bedrooms,
    bathrooms: Number(row.bathrooms),
    parkingSpaces: row.parkingSpaces,
    constructionArea:
      row.constructionAreaSqm === null
        ? undefined
        : Number(row.constructionAreaSqm),
    landArea: row.landAreaSqm === null ? undefined : Number(row.landAreaSqm),
    amenities: row.amenities,
    image,
    imageAlt,
  };
}

export async function listProperties() {
  const rows = await prisma.property.findMany({ orderBy: { id: "asc" } });
  return rows.map(mapProperty);
}

export async function listAvailableProperties() {
  const rows = await prisma.property.findMany({
    where: { status: "available", operation: "sale" },
    orderBy: { id: "asc" },
  });
  return rows.map(mapProperty);
}

export async function getPublicProperty(slug: string) {
  const row = await prisma.property.findFirst({
    where: { slug, status: { in: publicStatuses } },
  });
  return row ? mapProperty(row) : undefined;
}

export async function getIndexableProperties() {
  const rows = await prisma.property.findMany({
    where: { status: "available", operation: "sale" },
    orderBy: { id: "asc" },
  });
  return rows.map(mapProperty);
}

export async function getPropertyZones() {
  const zones = await prisma.property.findMany({
    where: { status: "available", operation: "sale" },
    distinct: ["municipality"],
    orderBy: { municipality: "asc" },
    select: { municipality: true },
  });
  return zones.map(({ municipality }) => municipality);
}
