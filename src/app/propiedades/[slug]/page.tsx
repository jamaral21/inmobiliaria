import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PropertyActions, PropertyTourButton } from "@/components/PropertyActions";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGallery } from "@/components/PropertyGallery";
import {
  filterAvailableProperties,
} from "@/lib/properties";
import {
  getIndexableProperties,
  getPublicProperty,
  getPropertySlugRedirect,
} from "@/lib/property-repository";
import { absoluteUrl, formatPrice, indexingEnabled } from "@/lib/site";

type RouteParams = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicProperty(slug);
  if (!property) {
    const redirectTo = await getPropertySlugRedirect(slug);
    if (redirectTo?.property.status !== "draft" && redirectTo?.property.status !== "withdrawn") {
      return { title: "Propiedad redirigida" };
    }
    return { title: "Propiedad no encontrada" };
  }
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
  const property = await getPublicProperty(slug);
  if (!property) {
    const redirectTo = await getPropertySlugRedirect(slug);
    if (redirectTo && !["draft", "withdrawn"].includes(redirectTo.property.status)) {
      permanentRedirect(`/propiedades/${redirectTo.property.slug}`);
    }
    notFound();
  }

  const available = property.status === "available";
  const related = filterAvailableProperties(await getIndexableProperties())
    .filter((item) => item.id !== property.id)
    .slice(0, 3);
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
      <header className="pdp-heading">
        <div>
          <p className="eyebrow">
            {property.type} en {(property.operation ?? "sale") === "sale" ? "venta" : "renta"} · {property.zone}, Querétaro
          </p>
          <h1>{property.title}</h1>
          <p className="pdp-location">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {property.neighborhood}, Querétaro
          </p>
        </div>
        {/* TODO: Re-enable the save property control when favorites are ready for release. */}
      </header>

      <PropertyGallery
        photos={property.photos ?? [{ src: property.image, alt: property.imageAlt }]}
        title={property.title}
        publicCode={property.publicCode}
        statusLabel={
          available
            ? "Disponible"
            : property.status === "reserved"
              ? "Reservada"
              : "Vendida"
        }
      />

      <div className="pdp-layout">
        <div className="pdp-main">
          <section className="pdp-specs" aria-label="Características principales">
            <div>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 18V7m18 11v-7H3m0 5h18M6 11V6h12v5M12 6v5" />
              </svg>
              <strong>{property.bedrooms}</strong>
              <span>Recámaras</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12h18l-2 7H6l-3-7Zm3 7v2m12-2v2M5 12V5a2 2 0 0 1 4 0v2" />
              </svg>
              <strong>{property.bathrooms}</strong>
              <span>Baños</span>
            </div>
            {property.constructionArea !== undefined && (
              <div>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="1" />
                  <path d="m8 16 8-8m-6 0h6v6" />
                </svg>
                <strong>{property.constructionArea} m²</strong>
                <span>Construcción</span>
              </div>
            )}
            <div>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {property.landArea ? (
                  <>
                    <rect x="4" y="4" width="16" height="16" rx="1" />
                    <path d="M8 8h8v8H8zM4 10h4m8 4h4M10 4v4m4 8v4" />
                  </>
                ) : (
                  <path d="M3 17h18l-2-7H5l-2 7Zm3 0v3m12-3v3M5 10V7h14v3" />
                )}
              </svg>
              <strong>{property.landArea ?? property.parkingSpaces} {property.landArea ? "m²" : ""}</strong>
              <span>{property.landArea ? "Terreno" : "Estacionamientos"}</span>
            </div>
          </section>
          <section className="pdp-description">
            <span className="eyebrow">La propiedad</span>
            <h2>
              Un espacio para <em>hacerlo tuyo.</em>
            </h2>
            <p>{property.description}</p>
          </section>
          <section className="pdp-amenities">
            <span className="eyebrow">Los detalles hacen el hogar</span>
            <h2>Lo que ofrece</h2>
            <ul>
              {property.amenities.map((amenity) => (
                <li key={amenity}>
                  <span aria-hidden="true">✓</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </section>
          <PropertyTourButton tourUrl={property.tourUrl} />
          <p className="pdp-disclaimer">
            La disponibilidad y las características de esta propiedad pueden cambiar. Confirma los
            detalles antes de tomar una decisión.
          </p>
        </div>
        <aside className="pdp-sidebar">
          <div className="pdp-sidebar-card">
            <span className="eyebrow">Tu próximo comienzo · {property.publicCode}</span>
            <p className="pdp-price">{formatPrice(property.price)} <span>MXN</span></p>
            <p className="pdp-price-note">No incluye gastos de escrituración.</p>
            <div className="pdp-sidebar-divider" />
            <h2>¿Te imaginas viviendo aquí?</h2>
            <p>Conoce cada rincón y descubre si podría ser tu lugar.</p>
            {available ? (
              <PropertyActions
                propertyName={property.title}
                location={property.neighborhood}
                tourUrl={property.tourUrl}
              />
            ) : (
              <div className="unavailable-note">
                Esta propiedad no está disponible. No se reciben solicitudes sobre este inmueble.
              </div>
            )}
            <p className="pdp-sidebar-reassurance">
              <span aria-hidden="true">✓</span>
              Demo solamente · No se enviarán ni guardarán datos
            </p>
          </div>
        </aside>
      </div>
      <section className="pdp-related">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Otras formas de sentirte en casa</span>
            <h2>
              También podrían <em>ser tu lugar.</em>
            </h2>
          </div>
          <Link className="text-link" href="/propiedades">
            Ver catálogo <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="property-grid">
          {related.map((item) => (
            <PropertyCard key={item.id} property={item} />
          ))}
        </div>
      </section>
      {available && (
        <PropertyActions
          propertyName={property.title}
          location={property.neighborhood}
          price={formatPrice(property.price)}
          variant="mobile"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
