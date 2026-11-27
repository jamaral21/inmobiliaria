import type { PropertyStatus } from "@prisma/client";
import type { PropertyPhoto } from "@/lib/properties";

export const propertyStatusTransitions: Record<PropertyStatus, PropertyStatus[]> = {
  draft: ["available", "withdrawn"],
  available: ["reserved", "sold", "withdrawn"],
  reserved: ["available", "sold", "withdrawn"],
  sold: ["available", "withdrawn"],
  withdrawn: ["draft"],
};

export function canTransitionPropertyStatus(
  current: PropertyStatus,
  next: PropertyStatus,
) {
  return propertyStatusTransitions[current].includes(next);
}

export type ApproximateLocation = {
  latitude: number;
  longitude: number;
  label?: string;
};

export type AdminPropertyInput = {
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
  approximateLocation: ApproximateLocation | null;
  tourUrl: string | null;
  verifiedAt: Date | null;
  authorizationReference: string | null;
  partnerNotes: string | null;
};

function text(form: FormData, key: string, maximum: number) {
  const value = form.get(key);
  if (typeof value !== "string") throw new Error(`El campo ${key} no es válido.`);
  const trimmed = value.trim();
  if (trimmed.length > maximum) throw new Error(`El campo ${key} excede el límite.`);
  return trimmed;
}

function optionalNumber(form: FormData, key: string, integer = false) {
  const value = text(form, key, 40);
  if (!value) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
    throw new Error(`El campo ${key} debe ser un número válido.`);
  }
  return number;
}

function optionalHttpsUrl(value: string, label: string) {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} debe ser una URL válida.`);
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${label} debe usar HTTPS y no incluir credenciales.`);
  }
  return url.toString();
}

export function parsePropertyForm(form: FormData): AdminPropertyInput {
  const slug = text(form, "slug", 100);
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("El slug solo puede contener minúsculas, números y guiones.");
  }

  const type = text(form, "type", 30);
  if (type !== "Casa" && type !== "Departamento") {
    throw new Error("El tipo de inmueble no es válido.");
  }
  const operation = text(form, "operation", 20);
  if (operation !== "sale" && operation !== "rent") {
    throw new Error("La operación no es válida.");
  }

  const photosValue = text(form, "photos", 12000);
  const photos = photosValue
    ? photosValue.split("\n").map((line) => {
        const [rawSrc, ...rawAlt] = line.split("\t");
        const src = optionalHttpsUrl(rawSrc.trim(), "La foto");
        const alt = rawAlt.join("\t").trim();
        if (!src || !alt || alt.length > 180) {
          throw new Error("Cada foto necesita una URL HTTPS y texto alternativo.");
        }
        return { src, alt };
      })
    : [];
  if (photos.length > 20) throw new Error("La galería admite hasta 20 fotos.");

  const price = optionalNumber(form, "priceMxn");
  if (price !== null && price <= 0) throw new Error("El precio debe ser mayor que cero.");

  const amenities = text(form, "amenities", 2000)
    .split(",")
    .map((amenity) => amenity.trim())
    .filter(Boolean);
  const rawLocation = text(form, "approximateLocation", 1000);
  let approximateLocation: ApproximateLocation | null = null;
  if (rawLocation) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawLocation);
    } catch {
      throw new Error("La ubicación aproximada debe ser JSON válido.");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("La ubicación aproximada debe ser un objeto JSON.");
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
      throw new Error("La ubicación requiere latitud y longitud válidas, con etiqueta opcional.");
    }
    approximateLocation = {
      latitude: Number(latitude.toFixed(2)),
      longitude: Number(longitude.toFixed(2)),
      ...(label ? { label } : {}),
    };
  }

  const rawVerifiedAt = text(form, "verifiedAt", 20);
  const verifiedAt = rawVerifiedAt ? new Date(`${rawVerifiedAt}T00:00:00.000Z`) : null;
  if (verifiedAt && Number.isNaN(verifiedAt.getTime())) {
    throw new Error("La fecha de verificación no es válida.");
  }

  return {
    slug,
    title: text(form, "title", 160),
    description: text(form, "description", 10000),
    type,
    operation,
    priceMxn: price,
    municipality: text(form, "municipality", 120) || null,
    neighborhood: text(form, "neighborhood", 120) || null,
    bedrooms: optionalNumber(form, "bedrooms", true),
    bathrooms: optionalNumber(form, "bathrooms"),
    parkingSpaces: optionalNumber(form, "parkingSpaces", true),
    constructionAreaSqm: optionalNumber(form, "constructionAreaSqm"),
    landAreaSqm: optionalNumber(form, "landAreaSqm"),
    amenities,
    photos,
    approximateLocation,
    tourUrl: optionalHttpsUrl(text(form, "tourUrl", 2000), "El recorrido"),
    verifiedAt,
    authorizationReference: text(form, "authorizationReference", 300) || null,
    partnerNotes: text(form, "partnerNotes", 5000) || null,
  };
}

export function publicationIssues(
  property: {
    slug: string;
    title: string;
    description: string;
    type: string;
    operation: string;
    priceMxn: number | { toString(): string } | null;
    municipality: string | null;
    neighborhood: string | null;
    bedrooms: number | null;
    bathrooms: number | { toString(): string } | null;
    parkingSpaces: number | null;
    photos: unknown;
  },
) {
  const issues: string[] = [];
  if (!property.title.trim()) issues.push("título");
  if (!property.description.trim()) issues.push("descripción");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug)) issues.push("slug válido");
  if (property.priceMxn === null || Number(property.priceMxn) <= 0) issues.push("precio mayor a cero");
  if (!property.municipality?.trim()) issues.push("municipio");
  if (!property.neighborhood?.trim()) issues.push("colonia");
  if (property.bedrooms === null || property.bedrooms < 0) issues.push("recámaras");
  if (property.bathrooms === null || Number(property.bathrooms) < 0) issues.push("baños");
  if (property.parkingSpaces === null || property.parkingSpaces < 0) issues.push("estacionamientos");
  if (property.type !== "Casa" && property.type !== "Departamento") issues.push("tipo de inmueble");
  if (property.operation !== "sale" && property.operation !== "rent") issues.push("operación");

  const photos = parseStoredPhotos(property.photos);
  if (!photos.length) {
    issues.push("al menos una foto con texto alternativo");
  }

  return issues;
}

export function parseStoredPhotos(value: unknown): PropertyPhoto[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((photo) => {
    if (!photo || typeof photo !== "object" || Array.isArray(photo)) return [];
    const stored = photo as { src?: unknown; alt?: unknown };
    const src = stored.src;
    const alt = stored.alt;
    if (typeof src !== "string" || typeof alt !== "string" || !alt.trim()) return [];
    try {
      const url = new URL(src);
      return url.protocol === "https:" && !url.username && !url.password
        ? [{ src, alt: alt.trim() }]
        : [];
    } catch {
      return [];
    }
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
