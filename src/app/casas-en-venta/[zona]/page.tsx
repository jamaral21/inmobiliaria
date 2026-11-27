import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DemoNotice } from "@/components/DemoNotice";
import { PropertyCard } from "@/components/PropertyCard";
import { filterAvailableProperties } from "@/lib/properties";
import { getPropertyZones, listAvailableProperties } from "@/lib/property-repository";

type RouteParams = Promise<{ zona: string }>;

export const dynamic = "force-dynamic";

async function zoneFromSlug(slug: string) {
  return (await getPropertyZones()).find(
    (zone) => zone.toLowerCase().replaceAll(" ", "-") === slug,
  );
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { zona } = await params;
  const zone = await zoneFromSlug(zona);
  return {
    title: zone ? `Casas en venta en ${zone}` : "Zona no encontrada",
    description: zone
      ? `Explora propiedades de demostración en ${zone}, Querétaro.`
      : undefined,
    robots: { index: false, follow: true },
  };
}

export default async function ZonePage({ params }: { params: RouteParams }) {
  const { zona } = await params;
  const zone = await zoneFromSlug(zona);
  if (!zone) notFound();

  const properties = await listAvailableProperties();
  const listings = filterAvailableProperties(properties, { zone });
  return (
    <div className="container page-shell">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Zonas", href: "/propiedades" }, { label: zone }]} />
      <div className="page-intro">
        <span className="eyebrow">Explora Querétaro</span>
        <h1>Casas en venta en {zone}.</h1>
        <p>Una selección de viviendas de demostración en esta zona.</p>
      </div>
      <DemoNotice />
      <p className="editorial-pending">
        Página de muestra. El contenido editorial de esta zona está pendiente de validación con el socio y no se indexa.
      </p>
      <div className="property-grid zone-listings">
        {listings.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </div>
  );
}
