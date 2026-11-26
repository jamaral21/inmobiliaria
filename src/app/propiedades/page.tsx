import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "@/components/DemoNotice";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import {
  filterAvailableProperties,
  paginateProperties,
  properties,
} from "@/lib/properties";
import { indexingEnabled } from "@/lib/site";

type SearchParams = Promise<{
  zona?: string;
  tipo?: string;
  recamaras?: string;
  precioMax?: string;
  pagina?: string;
}>;

function pageHref(
  page: number,
  params: Awaited<SearchParams>,
) {
  const query = new URLSearchParams();
  if (params.zona) query.set("zona", params.zona);
  if (params.tipo) query.set("tipo", params.tipo);
  if (params.recamaras) query.set("recamaras", params.recamaras);
  if (params.precioMax) query.set("precioMax", params.precioMax);
  if (page > 1) query.set("pagina", String(page));
  const search = query.toString();
  return search ? `/propiedades?${search}` : "/propiedades";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.values(params).some(Boolean);
  return {
    title: "Propiedades en venta",
    description:
      "Explora casas y departamentos de demostración en Querétaro. Filtra por zona, tipo, recámaras y presupuesto.",
    alternates: { canonical: "/propiedades" },
    robots: {
      index: indexingEnabled && !hasFilters,
      follow: indexingEnabled,
    },
    openGraph: {
      title: "Propiedades en venta en Querétaro",
      description: "Encuentra espacios para tu próximo capítulo.",
      url: "/propiedades",
    },
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const maxPrice = Number(params.precioMax);
  const bedrooms = Number(params.recamaras);
  const filtered = filterAvailableProperties(properties, {
    zone: params.zona || undefined,
    type: params.tipo || undefined,
    bedrooms: Number.isFinite(bedrooms) && bedrooms > 0 ? bedrooms : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
  });
  const pageNumber = Number(params.pagina);
  const page = paginateProperties(
    filtered,
    Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  );

  return (
    <div className="container page-shell">
      <div className="page-intro">
        <span className="eyebrow">Catálogo</span>
        <h1>Encuentra tu próximo espacio.</h1>
        <p>Busca entre propiedades de muestra en distintas zonas de Querétaro.</p>
      </div>
      <DemoNotice />
      <section className="catalog-layout" aria-labelledby="catalog-heading">
        <aside className="filter-panel">
          <span className="eyebrow">Afina tu búsqueda</span>
          <h2 id="catalog-heading">Filtros</h2>
          <SearchForm
            filters={{
              zone: params.zona,
              type: params.tipo,
              bedrooms: Number.isFinite(bedrooms) && bedrooms > 0 ? bedrooms : undefined,
              maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
            }}
          />
        </aside>
        <div className="catalog-results">
          <div className="results-heading">
            <p>
              <strong>{page.totalCount}</strong>{" "}
              {page.totalCount === 1 ? "propiedad disponible" : "propiedades disponibles"}
            </p>
            <span>
              {page.totalCount
                ? `Mostrando ${page.firstIndex}–${page.lastIndex} de ${page.totalCount}`
                : "Resultados de demostración"}
            </span>
          </div>
          {page.totalCount ? (
            <div className="property-grid">
              {page.items.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">⌕</span>
              <h2>No encontramos propiedades con esos filtros.</h2>
              <p>Prueba con otra zona o amplía tu presupuesto.</p>
              <Link className="button button-dark" href="/propiedades">
                Limpiar filtros
              </Link>
            </div>
          )}
          {page.totalPages > 1 && (
            <nav className="catalog-pagination" aria-label="Paginación del catálogo">
              {page.currentPage > 1 && (
                <Link
                  href={pageHref(page.currentPage - 1, params)}
                  aria-label="Página anterior"
                >
                  Anterior
                </Link>
              )}
              {Array.from({ length: page.totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Link
                    href={pageHref(pageNumber, params)}
                    key={pageNumber}
                    aria-current={pageNumber === page.currentPage ? "page" : undefined}
                  >
                    {pageNumber}
                  </Link>
                ),
              )}
              {page.currentPage < page.totalPages && (
                <Link
                  href={pageHref(page.currentPage + 1, params)}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
