import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { filterAvailableProperties, properties } from "@/lib/properties";
import { indexingEnabled, siteDescription, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteName} | Casas en venta en Querétaro`,
  description: siteDescription,
  alternates: { canonical: "/" },
  robots: { index: indexingEnabled, follow: indexingEnabled },
};

export default function HomePage() {
  const featured = filterAvailableProperties(properties).slice(0, 3);

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" aria-hidden="true" />
            Bienvenido a tu siguiente etapa
          </div>
          <h1>
            No buscas una casa.
            <br />
            Buscas <em>tu lugar.</em>
          </h1>
          <p>
            Encuentra ese espacio que se siente como tú. Casas extraordinarias en
            el Querétaro que quieres vivir.
          </p>
          <div className="hero-note">
            <span aria-hidden="true">✳</span>
            <span>Buenas casas. Nuevos comienzos.</span>
          </div>
        </div>
        <div className="hero-image">
          <Image
            src="/images/casa-encino.png"
            alt="Residencia de muestra con alberca y jardín; imagen de demostración"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <div className="hero-image-shade" />
          <span className="hero-image-label">
            <span aria-hidden="true" />
            Espacios para vivir mejor
          </span>
          <Link className="hero-property" href="/propiedades">
            <span>
              <small>EXPLORA EL CATÁLOGO · DEMO</small>
              <strong>Casas para tu siguiente etapa.</strong>
            </span>
            <span className="circle-arrow" aria-hidden="true">↗</span>
          </Link>
          <div className="image-pagination" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      <section className="container home-search">
        <SearchForm variant="home" />
        <div className="home-search-note">
          <span>
            <span aria-hidden="true">✓</span>
            Datos y precios ficticios; esta es una demostración.
          </span>
          <span>Tu próximo hogar empieza aquí.</span>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Encuentra tu próximo hogar</span>
              <h2>
                Espacios que hacen <em>clic contigo.</em>
              </h2>
              <p>Una selección de casas que tienen algo especial. Como tú.</p>
            </div>
            <Link className="text-link" href="/propiedades">
              Ver todo el catálogo <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="seller-callout container">
        <div className="seller-callout-copy">
          <span className="eyebrow">¿Tienes una propiedad?</span>
          <h2>El siguiente hogar de alguien puede empezar contigo.</h2>
          <p>Conoce cómo podemos ayudarte a presentar y promover tu casa.</p>
          <Link className="button button-dark" href="/vende-tu-casa">
            Quiero vender mi casa
          </Link>
        </div>
        <div className="seller-callout-image" role="img" aria-label="Interior acogedor de una casa">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </div>
      </section>
    </>
  );
}
