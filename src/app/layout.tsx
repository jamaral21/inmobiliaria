import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FigmaExperienceProvider } from "@/components/FigmaExperienceProvider";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Casas en venta en Querétaro`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName,
    title: `${siteName} | Casas en venta en Querétaro`,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <FigmaExperienceProvider>
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
        </FigmaExperienceProvider>
      </body>
    </html>
  );
}
