import { PrismaClient } from "@prisma/client";
import { properties } from "../src/lib/properties";

const prisma = new PrismaClient();

async function main() {
  for (const property of properties) {
    await prisma.property.upsert({
      where: { sourceReference: `habita-demo:${property.id}` },
      create: {
        id: property.id,
        publicCode: property.publicCode,
        sourceReference: `habita-demo:${property.id}`,
        slug: property.slug,
        title: property.title,
        description: property.description,
        type: property.type,
        operation: "sale",
        status: property.status,
        priceMxn: property.price,
        municipality: property.zone,
        neighborhood: property.neighborhood,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parkingSpaces: property.parkingSpaces,
        constructionAreaSqm: property.constructionArea,
        landAreaSqm: property.landArea,
        amenities: property.amenities,
        photos: [{ src: property.image, alt: property.imageAlt }],
      },
      update: {
        publicCode: property.publicCode,
        slug: property.slug,
        title: property.title,
        description: property.description,
        type: property.type,
        operation: "sale",
        status: property.status,
        priceMxn: property.price,
        municipality: property.zone,
        neighborhood: property.neighborhood,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parkingSpaces: property.parkingSpaces,
        constructionAreaSqm: property.constructionArea,
        landAreaSqm: property.landArea,
        amenities: property.amenities,
        photos: [{ src: property.image, alt: property.imageAlt }],
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed demo properties.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
