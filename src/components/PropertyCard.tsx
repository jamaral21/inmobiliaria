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
        <span className="image-code">{property.publicCode}</span>
      </Link>
      <div className="property-card-content">
        <p className="eyebrow">{property.type} en {property.zone}</p>
        <h3>
          <Link href={`/propiedades/${property.slug}`}>{property.title}</Link>
        </h3>
        <p className="property-price">{formatPrice(property.price)}</p>
        <div className="property-facts" aria-label="Características">
          <span>{property.bedrooms} recámaras</span>
          <span>{property.bathrooms} baños</span>
          <span>{property.constructionArea} m²</span>
        </div>
      </div>
    </article>
  );
}
