import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DemoLeadForm } from "@/components/DemoLeadForm";
import { DemoNotice } from "@/components/DemoNotice";
import { PropertyCard } from "@/components/PropertyCard";
import {
  findPublicProperty,
  getIndexableProperties,
  properties,
} from "@/lib/properties";
import { absoluteUrl, formatPrice, indexingEnabled } from "@/lib/site";

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return properties
    .filter((property) => ["available", "reserved", "sold"].includes(property.status))
    .map((property) => ({ slug: property.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = findPublicProperty(slug);
  if (!property) return { title: "Propiedad no encontrada" };
  const indexable = indexingEnabled && property.status === "available";
  return {
    title: property.title,
    description: property.description,
    alternates: { canonical: `/propiedades/${property.slug}` },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: "article",
      title: property.title,
      description: `${formatPrice(property.price)} · ${property.zone}, Querétaro`,
      url: `/propiedades/${property.slug}`,
      images: [{ url: property.image, alt: property.imageAlt }],
    },
  };
}

export default async function PropertyPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const property = findPublicProperty(slug);
  if (!property) notFound();

  const available = property.status === "available";
  const related = getIndexableProperties()
    .filter((item) => item.id !== property.id)
    .slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: absoluteUrl(`/propiedades/${property.slug}`),
    image: property.image,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "MXN",
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container page-shell property-page">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Propiedades", href: "/propiedades" },
          { label: property.title },
        ]}
      />
      <DemoNotice compact />
      <div className="property-detail-grid">
        <div className="property-detail-main">
          <div className="property-hero-image">
            <Image
              src={property.image}
              alt={property.imageAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 66vw"
            />
            <span className={`status-pill status-${property.status}`}>
              {available ? "Disponible · demo" : property.status === "reserved" ? "Reservada · demo" : "Vendida · demo"}
            </span>
          </div>
          <div className="property-title-row">
            <div>
              <p className="eyebrow">{property.type} · {property.neighborhood}, Querétaro</p>
              <h1>{property.title}</h1>
            </div>
            <p className="property-detail-price">{formatPrice(property.price)}</p>
          </div>
          <div className="detail-facts">
            <div><strong>{property.bedrooms}</strong><span>Recámaras</span></div>
            <div><strong>{property.bathrooms}</strong><span>Baños</span></div>
            <div><strong>{property.parkingSpaces}</strong><span>Estacionamientos</span></div>
            <div><strong>{property.constructionArea} m²</strong><span>Construcción</span></div>
            {property.landArea && <div><strong>{property.landArea} m²</strong><span>Terreno</span></div>}
          </div>
          <section className="detail-section">
            <span className="eyebrow">La propiedad</span>
            <h2>Un espacio para vivirlo a tu manera.</h2>
            <p>{property.description}</p>
          </section>
          <section className="detail-section">
            <span className="eyebrow">Detalles</span>
            <h2>Lo que ofrece</h2>
            <ul className="amenity-list">
              {property.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}
            </ul>
          </section>
        </div>
        <aside className="property-sidebar">
          <div className="sidebar-card">
            <span className="eyebrow">{property.publicCode}</span>
            <p className="sidebar-price">{formatPrice(property.price)}</p>
            <p className="sidebar-location">{property.neighborhood}, Querétaro</p>
            {available ? (
              <Link className="button button-dark button-full" href="#solicitar-visita">
                Solicitar una visita <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <div className="unavailable-note">
                Esta propiedad no está disponible. No se reciben solicitudes sobre este inmueble.
              </div>
            )}
            <p className="sidebar-demo">Esta ficha y sus datos son ficticios.</p>
          </div>
        </aside>
      </div>
      {available && <DemoLeadForm propertyCode={property.publicCode} />}
      <section className="related-section">
        <div className="section-heading">
          <div><span className="eyebrow">Más para explorar</span><h2>También podría interesarte</h2></div>
          <Link className="text-link" href="/propiedades">Ver catálogo →</Link>
        </div>
        <div className="property-grid">
          {related.map((item) => <PropertyCard key={item.id} property={item} />)}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
