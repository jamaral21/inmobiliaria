import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/prisma";
import {
  getIndexableProperties,
  getPropertySlugRedirect,
  getPublicProperty,
  listAvailableProperties,
} from "../src/lib/property-repository";

loadEnvConfig(process.cwd());

test(
  "public inventory follows draft, publish, edit, redirect, and withdraw changes",
  { skip: process.env.RUN_DB_TESTS !== "true" },
  async () => {
    const id = randomUUID();
    const oldSlug = `admin-test-${id}`;
    const newSlug = `admin-test-updated-${id}`;
    const publicCode = `QRO-${id.slice(0, 8).toUpperCase()}`;

    try {
      await prisma.property.create({
        data: {
          id,
          publicCode,
          sourceReference: `admin-public-${id}`,
          slug: oldSlug,
          title: "Ficha de prueba",
          description: "Descripción inicial.",
          type: "Casa",
          operation: "sale",
          status: "draft",
          priceMxn: 3_000_000,
          municipality: "Querétaro",
          neighborhood: "Juriquilla",
          bedrooms: 3,
          bathrooms: 2,
          parkingSpaces: 2,
          amenities: ["Jardín"],
          photos: [{ src: "https://example.com/property.webp", alt: "Fachada" }],
          partnerNotes: "No debe aparecer en los datos públicos",
          authorizationReference: "AUT-PRUEBA",
        },
      });

      assert.equal(await getPublicProperty(oldSlug), undefined);
      assert.ok(!(await getIndexableProperties()).some((property) => property.id === id));

      await prisma.property.update({ where: { id }, data: { status: "available" } });
      const published = await getPublicProperty(oldSlug);
      assert.equal(published?.title, "Ficha de prueba");
      assert.equal(published?.publicCode, publicCode);
      assert.ok(!("sourceReference" in (published ?? {})));
      assert.ok(!("partnerNotes" in (published ?? {})));
      assert.ok(!("authorizationReference" in (published ?? {})));
      assert.ok((await listAvailableProperties()).some((property) => property.id === id));

      await prisma.property.update({ where: { id }, data: { operation: "rent" } });
      assert.ok((await listAvailableProperties()).some((property) => property.id === id));
      assert.ok((await getIndexableProperties()).some((property) => property.id === id));

      await prisma.$transaction(async (tx) => {
        await tx.property.update({
          where: { id },
          data: { slug: newSlug, title: "Ficha editada", priceMxn: 3_250_000 },
        });
        await tx.propertySlugRedirect.create({ data: { slug: oldSlug, propertyId: id } });
      });
      assert.equal((await getPublicProperty(newSlug))?.title, "Ficha editada");
      assert.equal((await getPropertySlugRedirect(oldSlug))?.property.slug, newSlug);
      assert.ok((await getIndexableProperties()).some((property) => property.slug === newSlug));

      await prisma.property.update({ where: { id }, data: { status: "withdrawn" } });
      assert.equal(await getPublicProperty(newSlug), undefined);
      assert.ok(!(await getIndexableProperties()).some((property) => property.id === id));
    } finally {
      await prisma.property.deleteMany({ where: { id } });
    }
  },
);
