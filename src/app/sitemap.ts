import type { MetadataRoute } from "next";
import { getIndexableProperties } from "@/lib/properties";
import { absoluteUrl, indexingEnabled } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingEnabled) return [];

  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/propiedades"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...getIndexableProperties().map((property) => ({
      url: absoluteUrl(`/propiedades/${property.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
