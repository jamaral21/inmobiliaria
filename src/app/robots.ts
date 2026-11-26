import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      host: absoluteUrl("/"),
    };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
