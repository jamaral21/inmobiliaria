import type { MetadataRoute } from "next";
import { getIndexableProperties } from "@/lib/property-repository";
import { absoluteUrl, indexingEnabled } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled) return [];

  const now = new Date();
  const properties = await getIndexableProperties();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/propiedades"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...properties.map((property) => ({
      url: absoluteUrl(`/propiedades/${property.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
