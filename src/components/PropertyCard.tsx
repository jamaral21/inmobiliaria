import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/properties";
import { formatPrice } from "@/lib/site";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="property-card">
      <Link
        className="property-card-image"
        href={`/propiedades/${property.slug}`}
        aria-label={`Ver ${property.title}`}
      >
        <Image
          src={property.image}
          alt={property.imageAlt}
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className="status-pill">Disponible · demo</span>
        <span className="property-image-caption">
          {property.type} en venta · demo
        </span>
        <span className="image-code">{property.publicCode}</span>
      </Link>
      <div className="property-card-content">
        <p className="property-price">
          {formatPrice(property.price)} <span>MXN</span>
        </p>
        <h3>
          <Link href={`/propiedades/${property.slug}`}>{property.title}</Link>
        </h3>
        <p className="property-location">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {property.zone}, Querétaro
        </p>
        <div className="property-facts" aria-label="Características">
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18V7m18 11v-7H3m0 5h18M6 11V6h12v5M12 6v5" />
            </svg>
            {property.bedrooms} rec.
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12h18l-2 7H6l-3-7Zm3 7v2m12-2v2M5 12V5a2 2 0 0 1 4 0v2" />
            </svg>
            {property.bathrooms} baños
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="1" />
              <path d="m8 16 8-8m-6 0h6v6" />
            </svg>
            {property.constructionArea} m²
          </span>
        </div>
        <Link
          className="property-card-link"
          href={`/propiedades/${property.slug}`}
        >
          Conocer propiedad
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
