import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { DemoNotice } from "@/components/DemoNotice";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { filterAvailableProperties, properties } from "@/lib/properties";
import { indexingEnabled, siteDescription } from "@/lib/site";

export const metadata: Metadata = {
  title: "Casas en venta en Querétaro",
  description: siteDescription,
  alternates: { canonical: "/" },
  robots: { index: indexingEnabled, follow: indexingEnabled },
};

export default function HomePage() {
  const featured = filterAvailableProperties(properties).slice(0, 3);

  return (
    <>
      <section className="hero">
        <Image
          className="hero-image"
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90"
          alt="Casa contemporánea rodeada de vegetación"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="hero-kicker">Un nuevo capítulo empieza aquí</span>
          <h1>Encuentra un lugar que se sienta como hogar.</h1>
          <p>Casas seleccionadas en Querétaro, con información clara y trato cercano.</p>
          <Link className="button button-light" href="/propiedades">
            Descubrir propiedades <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-caption">QUERÉTARO, MÉXICO · VISTA DE DEMOSTRACIÓN</div>
      </section>

      <div className="container demo-wrap">
        <DemoNotice />
      </div>

      <section className="container search-section">
        <div className="section-heading search-heading">
          <div>
            <span className="eyebrow">Encuentra tu espacio</span>
            <h2>¿Qué estás buscando?</h2>
          </div>
          <p>Explora con calma. Empieza por lo que más importa.</p>
        </div>
        <SearchForm />
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Una selección para ti</span>
              <h2>Espacios que inspiran</h2>
            </div>
            <Link className="text-link" href="/propiedades">
              Ver todas las propiedades <span aria-hidden="true">→</span>
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
