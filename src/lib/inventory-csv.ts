import { parse } from "csv-parse/sync";
import { slugify } from "@/lib/admin-inventory";
import type { PropertyPhoto } from "@/lib/properties";

export const inventoryCsvHeaders = [
  "sourceReference",
  "slug",
  "title",
  "description",
  "type",
  "operation",
  "priceMxn",
  "municipality",
  "neighborhood",
  "bedrooms",
  "bathrooms",
  "parkingSpaces",
  "constructionAreaSqm",
  "landAreaSqm",
  "amenities",
  "photos",
  "approximateLocation",
  "tourUrl",
  "verifiedAt",
  "authorizationReference",
  "partnerNotes",
] as const;

export type InventoryCsvRow = {
  rowNumber: number;
  sourceReference: string;
  slug: string;
  title: string;
  description: string;
  type: "Casa" | "Departamento";
  operation: "sale" | "rent";
  priceMxn: number | null;
  municipality: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  constructionAreaSqm: number | null;
  landAreaSqm: number | null;
  amenities: string[];
  photos: PropertyPhoto[];
  approximateLocation: { latitude: number; longitude: number; label?: string } | null;
  tourUrl: string | null;
  verifiedAt: Date | null;
  authorizationReference: string | null;
  partnerNotes: string | null;
};

export type InventoryCsvIssue = { row: number; message: string };

function value(record: Record<string, string>, field: string, maximum = 10000) {
  const result = record[field]?.trim() ?? "";
  if (result.length > maximum) throw new Error(`${field} excede el límite.`);
  return result;
}

function numberValue(record: Record<string, string>, field: string, integer = false) {
  const raw = value(record, field, 40);
  if (!raw) return null;
  const number = Number(raw);
  if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
    throw new Error(`${field} debe ser un número válido.`);
  }
  if (field === "priceMxn" && number === 0) throw new Error("priceMxn debe ser mayor que cero.");
  return number;
}

function httpsUrl(raw: string, field: string) {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${field} no es una URL válida.`);
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${field} debe usar HTTPS y no incluir credenciales.`);
  }
  return url.toString();
}

function parsePhotos(raw: string) {
  if (!raw) return [];
  return raw.split(";").map((entry) => {
    const separator = entry.indexOf("|");
    if (separator <= 0) throw new Error("Cada foto debe tener formato URL|texto alternativo.");
    const src = httpsUrl(entry.slice(0, separator).trim(), "photo URL");
    const alt = entry.slice(separator + 1).trim();
    if (!src || !alt || alt.length > 180) {
      throw new Error("Cada foto necesita URL HTTPS y texto alternativo (máximo 180 caracteres).");
    }
    return { src, alt };
  });
}

function parseApproximateLocation(raw: string) {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("approximateLocation debe ser JSON válido.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("approximateLocation debe ser un objeto JSON.");
  }
  const location = parsed as Record<string, unknown>;
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const label = typeof location.label === "string" ? location.label.trim() : "";
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    label.length > 120 ||
    Object.keys(location).some((key) => !["latitude", "longitude", "label"].includes(key))
  ) {
    throw new Error("approximateLocation necesita latitud/longitud válidas y una etiqueta opcional.");
  }
  return {
    latitude: Number(latitude.toFixed(2)),
    longitude: Number(longitude.toFixed(2)),
    ...(label ? { label } : {}),
  };
}

function parseDate(raw: string) {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("verifiedAt debe usar YYYY-MM-DD.");
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
    throw new Error("verifiedAt no es una fecha válida.");
  }
  return date;
}

function parseRow(record: Record<string, string>, rowNumber: number): InventoryCsvRow {
  const sourceReference = value(record, "sourceReference", 300);
  if (!sourceReference) throw new Error("sourceReference es obligatorio.");

  const rawType = value(record, "type", 30) || "Casa";
  const type = rawType === "Departamento" ? "Departamento" : rawType === "Casa" ? "Casa" : null;
  if (!type) throw new Error("type debe ser Casa o Departamento.");

  const rawOperation = value(record, "operation", 20) || "sale";
  const operation = rawOperation === "rent" ? "rent" : rawOperation === "sale" ? "sale" : null;
  if (!operation) throw new Error("operation debe ser sale o rent.");

  const slugInput = value(record, "slug", 100);
  const slug = slugInput ? slugInput : slugify(value(record, "title", 160));
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("slug solo admite minúsculas, números y guiones.");
  }

  return {
    rowNumber,
    sourceReference,
    slug,
    title: value(record, "title", 160),
    description: value(record, "description", 10000),
    type,
    operation,
    priceMxn: numberValue(record, "priceMxn"),
    municipality: value(record, "municipality", 120) || null,
    neighborhood: value(record, "neighborhood", 120) || null,
    bedrooms: numberValue(record, "bedrooms", true),
    bathrooms: numberValue(record, "bathrooms"),
    parkingSpaces: numberValue(record, "parkingSpaces", true),
    constructionAreaSqm: numberValue(record, "constructionAreaSqm"),
    landAreaSqm: numberValue(record, "landAreaSqm"),
    amenities: value(record, "amenities", 2000).split("|").map((item) => item.trim()).filter(Boolean),
    photos: parsePhotos(value(record, "photos", 12000)),
    approximateLocation: parseApproximateLocation(value(record, "approximateLocation", 1000)),
    tourUrl: httpsUrl(value(record, "tourUrl", 2000), "tourUrl"),
    verifiedAt: parseDate(value(record, "verifiedAt", 20)),
    authorizationReference: value(record, "authorizationReference", 300) || null,
    partnerNotes: value(record, "partnerNotes", 5000) || null,
  };
}

export function parseInventoryCsv(csvText: string) {
  if (!csvText.trim()) return { rows: [] as InventoryCsvRow[], issues: [{ row: 1, message: "El archivo está vacío." }] };
  if (Buffer.byteLength(csvText, "utf8") > 1_000_000) {
    return { rows: [] as InventoryCsvRow[], issues: [{ row: 1, message: "El archivo supera 1 MB." }] };
  }

  let records: Record<string, string>[];
  try {
    records = parse(csvText, {
      bom: true,
      columns: (headers: string[]) => headers.map((header) => header.trim()),
      skip_empty_lines: true,
      trim: true,
      max_record_size: 20000,
    }) as Record<string, string>[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "CSV mal formado.";
    return { rows: [] as InventoryCsvRow[], issues: [{ row: 1, message }] };
  }
  if (records.length > 1000) {
    return { rows: [] as InventoryCsvRow[], issues: [{ row: 1, message: "El archivo admite hasta 1,000 filas." }] };
  }

  const headers = Object.keys(records[0] ?? {});
  const missing = inventoryCsvHeaders.filter((header) => !headers.includes(header));
  if (missing.length) {
    return {
      rows: [] as InventoryCsvRow[],
      issues: [{ row: 1, message: `Faltan columnas: ${missing.join(", ")}.` }],
    };
  }

  const rows: InventoryCsvRow[] = [];
  const issues: InventoryCsvIssue[] = [];
  const seen = new Set<string>();
  records.forEach((record, index) => {
    const rowNumber = index + 2;
    try {
      const row = parseRow(record, rowNumber);
      if (seen.has(row.sourceReference)) {
        issues.push({ row: rowNumber, message: `sourceReference duplicada: ${row.sourceReference}.` });
        return;
      }
      seen.add(row.sourceReference);
      rows.push(row);
    } catch (error) {
      issues.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : "Fila inválida.",
      });
    }
  });
  return { rows, issues };
}

export function inventoryCsvData(row: InventoryCsvRow, generatedSlug?: string) {
  return {
    sourceReference: row.sourceReference,
    slug: row.slug || generatedSlug || slugify(row.sourceReference),
    title: row.title,
    description: row.description,
    type: row.type,
    operation: row.operation,
    priceMxn: row.priceMxn,
    municipality: row.municipality,
    neighborhood: row.neighborhood,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpaces: row.parkingSpaces,
    constructionAreaSqm: row.constructionAreaSqm,
    landAreaSqm: row.landAreaSqm,
    amenities: row.amenities,
    photos: row.photos,
    approximateLocation: row.approximateLocation,
    tourUrl: row.tourUrl,
    verifiedAt: row.verifiedAt,
    authorizationReference: row.authorizationReference,
    partnerNotes: row.partnerNotes,
  };
}
