import assert from "node:assert/strict";
import test from "node:test";
import { isAdminEmail, isAdminSession } from "../src/lib/admin-identity";
import {
  canTransitionPropertyStatus,
  publicationIssues,
  slugify,
} from "../src/lib/admin-inventory";
import {
  inventoryCsvHeaders,
  parseInventoryCsv,
} from "../src/lib/inventory-csv";

function csvRow(values: Record<string, string>) {
  return inventoryCsvHeaders.map((header) => {
    const value = values[header] ?? "";
    return `"${value.replaceAll('"', '""')}"`;
  }).join(",");
}

const completeValues = {
  sourceReference: "broker-2026-001",
  slug: "casa-en-juriquilla",
  title: "Casa en Juriquilla",
  description: "Casa con jardín, cerca de servicios.",
  type: "Casa",
  operation: "sale",
  priceMxn: "4500000",
  municipality: "Querétaro",
  neighborhood: "Juriquilla",
  bedrooms: "3",
  bathrooms: "2.5",
  parkingSpaces: "2",
  constructionAreaSqm: "180",
  landAreaSqm: "220",
  amenities: "Jardín|Cocina equipada",
  photos: "https://example.com/casa.webp|Fachada de casa",
  tourUrl: "",
  authorizationReference: "autorización-1",
  partnerNotes: "Solo personal autorizado",
};

test("admin access matches only the configured identity", () => {
  assert.equal(isAdminEmail(undefined, "admin@example.com"), false);
  assert.equal(isAdminEmail("other@example.com", "admin@example.com"), false);
  assert.equal(isAdminEmail(" ADMIN@example.com ", "admin@example.com"), true);
  assert.equal(isAdminEmail("admin@example.com", ""), false);
  assert.equal(isAdminSession(null, "admin@example.com"), false);
  assert.equal(isAdminSession({ user: { email: "other@example.com" } }, "admin@example.com"), false);
  assert.equal(isAdminSession({ user: { email: "admin@example.com" } }, "admin@example.com"), true);
});

test("publication checklist distinguishes an incomplete draft from a complete listing", () => {
  const missing = publicationIssues({
    slug: "borrador-a1",
    title: "",
    description: "",
    type: "Casa",
    operation: "sale",
    priceMxn: null,
    municipality: null,
    neighborhood: null,
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    photos: [],
  });
  assert.ok(missing.includes("precio mayor a cero"));
  assert.ok(missing.includes("al menos una foto con texto alternativo"));

  assert.deepEqual(publicationIssues({
    slug: "casa-en-juriquilla",
    title: "Casa en Juriquilla",
    description: "Descripción.",
    type: "Casa",
    operation: "sale",
    priceMxn: 4_500_000,
    municipality: "Querétaro",
    neighborhood: "Juriquilla",
    bedrooms: 3,
    bathrooms: 2.5,
    parkingSpaces: 2,
    photos: [{ src: "https://example.com/casa.webp", alt: "Fachada" }],
  }), []);
});

test("status transitions expose publish, reserve, sold, withdraw and restore flows", () => {
  assert.equal(canTransitionPropertyStatus("draft", "available"), true);
  assert.equal(canTransitionPropertyStatus("available", "reserved"), true);
  assert.equal(canTransitionPropertyStatus("reserved", "sold"), true);
  assert.equal(canTransitionPropertyStatus("available", "withdrawn"), true);
  assert.equal(canTransitionPropertyStatus("withdrawn", "draft"), true);
  assert.equal(canTransitionPropertyStatus("draft", "sold"), false);
});

test("CSV import parser validates media, preserves quoted fields, and flags duplicate references", () => {
  const header = inventoryCsvHeaders.join(",");
  const text = [
    header,
    csvRow(completeValues),
    csvRow({ ...completeValues, slug: "otra-casa" }),
  ].join("\n");
  const result = parseInventoryCsv(text);

  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].rowNumber, 2);
  assert.equal(result.rows[0].description, completeValues.description);
  assert.deepEqual(result.rows[0].amenities, ["Jardín", "Cocina equipada"]);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0].message, /sourceReference duplicada/);
});

test("CSV import parser rejects unsafe photo URLs and missing required columns", () => {
  const unsafe = parseInventoryCsv([
    inventoryCsvHeaders.join(","),
    csvRow({ ...completeValues, photos: "http://example.com/image.jpg|Fachada" }),
  ].join("\n"));
  assert.equal(unsafe.rows.length, 0);
  assert.match(unsafe.issues[0].message, /HTTPS/);

  const missing = parseInventoryCsv("sourceReference,title\nexternal-1,Casa");
  assert.equal(missing.rows.length, 0);
  assert.match(missing.issues[0].message, /Faltan columnas/);
});

test("slug generation normalizes accents and punctuation", () => {
  assert.equal(slugify("Casa en Milenio III"), "casa-en-milenio-iii");
});
