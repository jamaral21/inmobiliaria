import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Property, PropertyPhoto, PropertyStatus } from "@/lib/properties";

const publicStatuses: PropertyStatus[] = ["available", "reserved", "sold"];

function mapProperty(row: Prisma.PropertyGetPayload<object>): Property {
  if (row.type !== "Casa" && row.type !== "Departamento") {
    throw new Error(`Unsupported property type "${row.type}" for ${row.slug}.`);
  }

  const photos: PropertyPhoto[] = Array.isArray(row.photos)
    ? row.photos.flatMap((photo) => {
        if (!photo || typeof photo !== "object" || Array.isArray(photo)) return [];
        const image = photo as Prisma.JsonObject;
        return typeof image.src === "string" && typeof image.alt === "string"
          ? [{ src: image.src, alt: image.alt }]
          : [];
      })
    : [];
  const firstPhoto = photos[0];
  if (!firstPhoto) {
    throw new Error(`Property ${row.slug} has no valid primary photo.`);
  }
  if (
    row.priceMxn === null ||
    row.municipality === null ||
    row.neighborhood === null ||
    row.bedrooms === null ||
    row.bathrooms === null ||
    row.parkingSpaces === null
  ) {
    throw new Error(`Published property ${row.slug} is missing required public data.`);
  }

  return {
    id: row.id,
    publicCode: row.publicCode,
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.type,
    operation: row.operation,
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
    photos,
    tourUrl: row.tourUrl ?? undefined,
    image: firstPhoto.src,
    imageAlt: firstPhoto.alt,
  };
}

export async function listProperties() {
  const rows = await prisma.property.findMany({ orderBy: { id: "asc" } });
  return rows.map(mapProperty);
}

export async function listAvailableProperties(operation?: Property["operation"]) {
  const rows = await prisma.property.findMany({
    where: { status: "available", ...(operation ? { operation } : {}) },
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

export async function getPropertySlugRedirect(slug: string) {
  return prisma.propertySlugRedirect.findUnique({
    where: { slug },
    select: { property: { select: { slug: true, status: true } } },
  });
}

export async function getIndexableProperties() {
  const rows = await prisma.property.findMany({
    where: { status: "available" },
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
  return zones.flatMap(({ municipality }) => municipality ? [municipality] : []);
}
