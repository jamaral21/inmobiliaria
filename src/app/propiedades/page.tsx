import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchForm } from "@/components/SearchForm";
import {
  filterAvailableProperties,
  paginateProperties,
} from "@/lib/properties";
import { listAvailableProperties } from "@/lib/property-repository";
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
    title: "Propiedades en Querétaro",
    description:
      "Explora casas y departamentos en Querétaro. Filtra por zona, tipo, recámaras y presupuesto.",
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
  const properties = await listAvailableProperties();
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
    <section className="container figma-catalog" aria-labelledby="catalog-heading">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo" },
        ]}
      />
      <span className="eyebrow">UN LUGAR PARA CADA HISTORIA</span>
      <h1 id="catalog-heading">
        Tu nueva vida <em>empieza aquí.</em>
      </h1>
      <p className="page-description">
        Explora casas y departamentos en las mejores zonas de Querétaro.
      </p>
      <SearchForm
        filters={{
          zone: params.zona,
          type: params.tipo,
          bedrooms: Number.isFinite(bedrooms) && bedrooms > 0 ? bedrooms : undefined,
          maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
        }}
      />
      <div className="figma-results-heading">
        <span>
          <strong>
            {page.totalCount} {page.totalCount === 1 ? "propiedad" : "propiedades"}
          </strong>{" "}
          para imaginar tu futuro
        </span>
        {(params.zona || params.tipo || params.recamaras || params.precioMax) && (
          <Link className="text-link" href="/propiedades">
            Limpiar filtros <span aria-hidden="true">×</span>
          </Link>
        )}
      </div>
      {page.totalCount ? (
        <div className="property-grid figma-catalog-grid">
          {page.items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="empty-state figma-empty-state">
          <span className="empty-state-icon" aria-hidden="true">⌕</span>
          <h2>Tu lugar sigue por descubrir.</h2>
          <p>Prueba otra zona o amplía tu presupuesto para encontrar más opciones.</p>
          <Link className="button button-primary figma-primary" href="/propiedades">
            Ver todas las propiedades
          </Link>
        </div>
      )}
      {page.totalPages > 1 && (
        <nav className="catalog-pagination figma-pagination" aria-label="Paginación del catálogo">
          {page.currentPage > 1 && (
            <Link href={pageHref(page.currentPage - 1, params)} aria-label="Página anterior">
              ← Anterior
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
            <Link href={pageHref(page.currentPage + 1, params)} aria-label="Página siguiente">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
