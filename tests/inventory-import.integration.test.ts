import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/prisma";
import { inventoryCsvHeaders } from "../src/lib/inventory-csv";
import { applyInventoryCsv } from "../src/lib/inventory-import";

loadEnvConfig(process.cwd());

test(
  "CSV reimport updates one stable reference without creating duplicates",
  { skip: process.env.RUN_DB_TESTS !== "true" },
  async () => {
    const reference = `admin-test-${randomUUID()}`;
    const slug = reference.toLowerCase();
    const values: Record<string, string> = {
      sourceReference: reference,
      slug,
      title: "Borrador importado",
      description: "",
      type: "Casa",
      operation: "sale",
      priceMxn: "",
      municipality: "",
      neighborhood: "",
      bedrooms: "",
      bathrooms: "",
      parkingSpaces: "",
      constructionAreaSqm: "",
      landAreaSqm: "",
      amenities: "",
      photos: "",
      tourUrl: "",
      authorizationReference: "",
      partnerNotes: "",
    };
    const csv = [
      inventoryCsvHeaders.join(","),
      inventoryCsvHeaders.map((header) => `"${values[header] ?? ""}"`).join(","),
    ].join("\n");

    try {
      const first = await applyInventoryCsv(csv);
      assert.equal(first.imported, 1);
      const created = await prisma.property.findUnique({
        where: { sourceReference: reference },
      });
      assert.ok(created);
      assert.equal(created.status, "draft");

      const second = await applyInventoryCsv(csv);
      assert.equal(second.imported, 0);
      assert.equal(second.entries[0]?.action, "Sin cambios");
      assert.equal(
        await prisma.property.count({ where: { sourceReference: reference } }),
        1,
      );
      const unchanged = await prisma.property.findUnique({
        where: { sourceReference: reference },
      });
      assert.equal(unchanged?.id, created.id);
      assert.equal(unchanged?.updatedAt.getTime(), created.updatedAt.getTime());
    } finally {
      await prisma.property.deleteMany({ where: { sourceReference: reference } });
    }
  },
);
