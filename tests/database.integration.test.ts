import assert from "node:assert/strict";
import test from "node:test";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/prisma";
import {
  getIndexableProperties,
  getPropertyZones,
  getPublicProperty,
  listAvailableProperties,
} from "../src/lib/property-repository";

loadEnvConfig(process.cwd());

test(
  "PostgreSQL seed serves public listings and hides internal statuses",
  { skip: process.env.RUN_DB_TESTS !== "true" },
  async () => {
    try {
      assert.equal(await prisma.property.count(), 11);

      const available = await listAvailableProperties();
      assert.equal(available.length, 7);
      assert.ok(available.every((property) => property.status === "available"));

      const featured = await getPublicProperty("casa-contemporanea-en-juriquilla");
      assert.equal(featured?.publicCode, "QRO-DEMO-001");
      assert.equal(featured?.imageAlt, "Casa contemporánea de dos niveles con jardín");

      assert.equal((await getPublicProperty("casa-reservada-demo"))?.status, "reserved");
      assert.equal(await getPublicProperty("casa-borrador-demo"), undefined);
      assert.equal(await getPublicProperty("casa-retirada-demo"), undefined);

      assert.deepEqual(await getPropertyZones(), [
        "Centro Sur",
        "El Refugio",
        "Juriquilla",
        "Milenio III",
        "Zibatá",
      ]);
      assert.equal((await getIndexableProperties()).length, 7);
    } finally {
      await prisma.$disconnect();
    }
  },
);
