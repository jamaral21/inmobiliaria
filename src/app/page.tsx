import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import { filterAvailableProperties } from "@/lib/properties";
import { listAvailableProperties } from "@/lib/property-repository";
import { indexingEnabled, siteDescription, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteName} | Casas en venta en Querétaro`,
  description: siteDescription,
  alternates: { canonical: "/" },
  robots: { index: indexingEnabled, follow: indexingEnabled },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = filterAvailableProperties(await listAvailableProperties()).slice(0, 3);

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

      <section className="values container" id="nosotros" aria-labelledby="values-heading">
        <div className="values-intro">
          <span className="eyebrow">MÁS QUE BIENES RAÍCES</span>
          <h2 id="values-heading">
            Tu siguiente capítulo,
            <br />
            <em>bien acompañado.</em>
          </h2>
          <p>
            Nos gusta Querétaro. Nos gusta conectar personas con lugares que hacen sentido para su
            vida.
          </p>
        </div>
        <div className="value">
          <span className="value-number">01 /</span>
          <h3>Curaduría, no cantidad</h3>
          <p>Casas elegidas por su ubicación, diseño y calidad de vida.</p>
        </div>
        <div className="value">
          <span className="value-number">02 /</span>
          <h3>A tu ritmo, siempre</h3>
          <p>Explora, pregunta y conoce cada ficha sin presión.</p>
        </div>
        <div className="value">
          <span className="value-number">03 /</span>
          <h3>De aquí, para ti</h3>
          <p>Descubre distintas zonas y lo que hace especial a cada una.</p>
        </div>
      </section>

      <section className="closing container">
        <div>
          <span className="eyebrow">EL SIGUIENTE PASO ES TUYO</span>
          <h2>Imagina tu vida aquí.</h2>
          <p>Nosotros te ayudamos a encontrar dónde.</p>
        </div>
        <Link className="button button-primary figma-primary" href="/propiedades">
          Encuentra tu casa <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
