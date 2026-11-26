export const siteName = "Habita Querétaro";
export const siteDescription =
  "Encuentra casas en venta en Querétaro con información clara y acompañamiento cercano.";

export const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
export const indexingEnabled = process.env.INDEXABLE === "true";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}
