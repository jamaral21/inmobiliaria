import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { publicationIssues, parseStoredPhotos, slugify } from "@/lib/admin-inventory";
import {
  inventoryCsvData,
  parseInventoryCsv,
  type InventoryCsvIssue,
  type InventoryCsvRow,
} from "@/lib/inventory-csv";
import { prisma } from "@/lib/prisma";

export type CsvPreviewEntry = {
  row: number;
  sourceReference: string;
  action: string;
  changes: string[];
};

export type CsvPreview = {
  entries: CsvPreviewEntry[];
  issues: InventoryCsvIssue[];
};

export type CsvImportResult = CsvPreview & { imported: number };

function stableFallbackSlug(reference: string) {
  return slugify(reference).slice(0, 80) ||
    `inmueble-${createHash("sha256").update(reference).digest("hex").slice(0, 12)}`;
}

function comparable(row: InventoryCsvRow, current?: {
  sourceReference: string | null;
  slug: string;
  title: string;
  description: string;
  type: string;
  operation: "sale" | "rent";
  priceMxn: { toString(): string } | null;
  municipality: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: { toString(): string } | null;
  parkingSpaces: number | null;
  constructionAreaSqm: { toString(): string } | null;
  landAreaSqm: { toString(): string } | null;
  amenities: string[];
  photos: unknown;
  approximateLocation: unknown;
  tourUrl: string | null;
  verifiedAt: Date | null;
  authorizationReference: string | null;
  partnerNotes: string | null;
}) {
  const next = inventoryCsvData(row, current?.slug || stableFallbackSlug(row.sourceReference));
  const old = current && {
    sourceReference: current.sourceReference,
    slug: current.slug,
    title: current.title,
    description: current.description,
    type: current.type,
    operation: current.operation,
    priceMxn: current.priceMxn === null ? null : Number(current.priceMxn),
    municipality: current.municipality,
    neighborhood: current.neighborhood,
    bedrooms: current.bedrooms,
    bathrooms: current.bathrooms === null ? null : Number(current.bathrooms),
    parkingSpaces: current.parkingSpaces,
    constructionAreaSqm: current.constructionAreaSqm === null ? null : Number(current.constructionAreaSqm),
    landAreaSqm: current.landAreaSqm === null ? null : Number(current.landAreaSqm),
    amenities: current.amenities,
    photos: parseStoredPhotos(current.photos),
    approximateLocation: current.approximateLocation,
    tourUrl: current.tourUrl,
    verifiedAt: current.verifiedAt,
    authorizationReference: current.authorizationReference,
    partnerNotes: current.partnerNotes,
  };
  const changed = old
    ? Object.keys(next).filter((key) => JSON.stringify(next[key as keyof typeof next]) !== JSON.stringify(old[key as keyof typeof old]))
    : Object.keys(next);
  return { next, changed };
}

async function previewParsed(rows: InventoryCsvRow[], issues: InventoryCsvIssue[]): Promise<CsvPreview> {
  const [existing, allSlugs, redirects] = await Promise.all([
    prisma.property.findMany({
      where: { sourceReference: { in: rows.map((row) => row.sourceReference) } },
    }),
    prisma.property.findMany({ select: { id: true, slug: true } }),
    prisma.propertySlugRedirect.findMany({
      select: { slug: true, propertyId: true },
    }),
  ]);
  const byReference = new Map(existing.map((property) => [property.sourceReference, property]));
  const slugOwners = new Map(allSlugs.map((property) => [property.slug, property.id]));
  const redirectOwners = new Map(redirects.map((redirect) => [redirect.slug, redirect.propertyId]));
  const requestedSlugs = new Set<string>();
  const entries: CsvPreviewEntry[] = [];

  rows.forEach((row) => {
    const current = byReference.get(row.sourceReference);
    const { next, changed } = comparable(row, current ?? undefined);
    const slug = row.slug || current?.slug || stableFallbackSlug(row.sourceReference);
    const slugOwner = slugOwners.get(slug);
    const redirectOwner = redirectOwners.get(slug);
    if (
      (slugOwner && slugOwner !== current?.id) ||
      (redirectOwner && redirectOwner !== current?.id) ||
      requestedSlugs.has(slug)
    ) {
      issues.push({ row: row.rowNumber, message: `El slug ${slug} ya está ocupado.` });
      return;
    }
    requestedSlugs.add(slug);

    if (current && current.status !== "draft" && current.status !== "withdrawn") {
      const property = { ...current, ...next, photos: next.photos };
      const incomplete = publicationIssues(property);
      if (incomplete.length) {
        issues.push({
          row: row.rowNumber,
          message: `La actualización dejaría incompleta una ficha publicada: ${incomplete.join(", ")}.`,
        });
        return;
      }
    }

    entries.push({
      row: row.rowNumber,
      sourceReference: row.sourceReference,
      action: !current ? "Nuevo borrador" : changed.length ? "Actualizar" : "Sin cambios",
      changes: changed,
    });
  });
  return { entries, issues };
}

export async function previewInventoryCsv(csvText: string): Promise<CsvPreview> {
  const parsed = parseInventoryCsv(csvText);
  return previewParsed(parsed.rows, parsed.issues);
}

export async function applyInventoryCsv(csvText: string): Promise<CsvImportResult> {
  const parsed = parseInventoryCsv(csvText);
  const preview = await previewParsed(parsed.rows, [...parsed.issues]);
  const validRows = new Set(
    preview.entries
      .filter((entry) => entry.action !== "Sin cambios")
      .map((entry) => entry.sourceReference),
  );
  const issues = [...preview.issues];
  let imported = 0;

  for (const row of parsed.rows) {
    if (!validRows.has(row.sourceReference)) continue;
    try {
      const id = randomUUID();
      const data = inventoryCsvData(row, stableFallbackSlug(row.sourceReference));
      const { approximateLocation, ...dataWithoutLocation } = data;
      const writeData = {
        ...dataWithoutLocation,
        approximateLocation: approximateLocation ?? Prisma.DbNull,
      };
      await prisma.$transaction(async (tx) => {
        const current = await tx.property.findUnique({
          where: { sourceReference: row.sourceReference },
        });
        const slug = row.slug || current?.slug || stableFallbackSlug(row.sourceReference);
        const duplicate = await tx.property.findUnique({ where: { slug } });
        if (duplicate && duplicate.id !== current?.id) {
          throw new Error(`El slug ${slug} ya está asignado a otro inmueble.`);
        }
        const redirect = await tx.propertySlugRedirect.findUnique({ where: { slug } });
        if (redirect && redirect.propertyId !== current?.id) {
          throw new Error(`El slug ${slug} está reservado por una redirección.`);
        }
        if (redirect) await tx.propertySlugRedirect.delete({ where: { slug } });

        if (!current) {
          await tx.property.create({
            data: {
              id,
              publicCode: `QRO-${id.slice(0, 8).toUpperCase()}`,
              ...writeData,
              slug,
              status: "draft",
            },
          });
        } else {
          const updated = await tx.property.update({
            where: { id: current.id },
            data: { ...writeData, slug },
          });
          if (
            current.slug !== updated.slug &&
            current.status !== "draft" &&
            current.status !== "withdrawn"
          ) {
            await tx.propertySlugRedirect.upsert({
              where: { slug: current.slug },
              create: { slug: current.slug, propertyId: current.id },
              update: { propertyId: current.id },
            });
          }
          if (current.status !== "draft" && current.status !== "withdrawn") {
            const incomplete = publicationIssues(updated);
            if (incomplete.length) {
              throw new Error(`La ficha publicada requiere: ${incomplete.join(", ")}.`);
            }
          }
        }
      });
      imported += 1;
    } catch (error) {
      issues.push({
        row: row.rowNumber,
        message: error instanceof Error ? error.message : "No se pudo importar la fila.",
      });
    }
  }
  return { entries: preview.entries, issues, imported };
}
