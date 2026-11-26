import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAvailableProperties,
  findPublicProperty,
  getIndexableProperties,
  getPropertyZones,
  paginateProperties,
  properties,
} from "../src/lib/properties";

test("catalog only exposes available properties", () => {
  const results = filterAvailableProperties(properties);
  assert.equal(results.length, 7);
  assert.ok(results.every((property) => property.status === "available"));
  assert.ok(!results.some((property) => property.slug === "casa-borrador-demo"));
  assert.ok(!results.some((property) => property.slug === "casa-retirada-demo"));
});

test("catalog filters can be combined without mutating the fixture inventory", () => {
  const initialLength = properties.length;
  const results = filterAvailableProperties(properties, {
    zone: "Juriquilla",
    type: "Casa",
    bedrooms: 3,
    maxPrice: 5_000_000,
  });
  assert.deepEqual(results.map((property) => property.slug), [
    "casa-contemporanea-en-juriquilla",
  ]);
  assert.equal(properties.length, initialLength);
});

test("budget and bedroom filters support a no-results state", () => {
  assert.deepEqual(
    filterAvailableProperties(properties, {
      bedrooms: 5,
      maxPrice: 2_000_000,
    }),
    [],
  );
});

test("catalog pagination clamps page numbers and returns stable result ranges", () => {
  const available = filterAvailableProperties(properties);
  const firstPage = paginateProperties(available, 1, 6);
  const lastPage = paginateProperties(available, 99, 6);

  assert.equal(firstPage.totalPages, 2);
  assert.equal(firstPage.firstIndex, 1);
  assert.equal(firstPage.lastIndex, 6);
  assert.equal(firstPage.items.length, 6);
  assert.equal(lastPage.currentPage, 2);
  assert.equal(lastPage.firstIndex, 7);
  assert.equal(lastPage.lastIndex, 7);
  assert.equal(lastPage.items.length, 1);
});

test("public detail routes allow available and temporarily unavailable listings only", () => {
  assert.equal(
    findPublicProperty("casa-contemporanea-en-juriquilla")?.status,
    "available",
  );
  assert.equal(findPublicProperty("casa-reservada-demo")?.status, "reserved");
  assert.equal(findPublicProperty("casa-vendida-demo")?.status, "sold");
  assert.equal(findPublicProperty("casa-borrador-demo"), undefined);
  assert.equal(findPublicProperty("casa-retirada-demo"), undefined);
});

test("only available listings are indexable and exposed as public zones", () => {
  assert.ok(getIndexableProperties().every((property) => property.status === "available"));
  assert.deepEqual(getPropertyZones(), [
    "Juriquilla",
    "El Refugio",
    "Milenio III",
    "Zibatá",
    "Centro Sur",
  ]);
});
