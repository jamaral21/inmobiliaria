import Link from "next/link";
import { createDraft, changePropertyStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import {
  publicationIssues,
  propertyStatusTransitions,
} from "@/lib/admin-inventory";
import { prisma } from "@/lib/prisma";
import type { PropertyStatus } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  neighborhood?: string;
  saved?: string;
  error?: string;
}>;

const statuses: PropertyStatus[] = ["draft", "available", "reserved", "sold", "withdrawn"];
const labels: Record<PropertyStatus, string> = {
  draft: "Borrador",
  available: "Disponible",
  reserved: "Reservada",
  sold: "Vendida",
  withdrawn: "Retirada",
};
export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = statuses.includes(params.status as PropertyStatus)
    ? (params.status as PropertyStatus)
    : undefined;
  const neighborhood = params.neighborhood?.trim() ?? "";
  const [properties, neighborhoods] = await Promise.all([
    prisma.property.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(neighborhood ? { neighborhood: { equals: neighborhood } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
                { publicCode: { contains: query, mode: "insensitive" } },
                { sourceReference: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.property.findMany({
      where: { neighborhood: { not: null } },
      distinct: ["neighborhood"],
      orderBy: { neighborhood: "asc" },
      select: { neighborhood: true },
    }),
  ]);

  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Inventario privado · {properties.length} resultados</p>
          <h1>Propiedades</h1>
        </div>
        <div className="admin-actions">
          <Link className="admin-link" href="/admin/import">Importar CSV</Link>
          <form action={createDraft}>
            <button className="button button-primary admin-button" type="submit">
              Crear borrador
            </button>
          </form>
        </div>
      </div>

      {params.saved && <p className="admin-message" role="status">Cambios guardados.</p>}
      {params.error && <p className="admin-error" role="alert">{params.error}</p>}

      <section className="admin-panel" aria-label="Listado de propiedades">
        <form className="admin-filter-row" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, slug, código o referencia"
            aria-label="Buscar propiedades"
          />
          <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {statuses.map((value) => <option value={value} key={value}>{labels[value]}</option>)}
          </select>
          <select name="neighborhood" defaultValue={neighborhood} aria-label="Filtrar por colonia">
            <option value="">Todas las colonias</option>
            {neighborhoods.flatMap(({ neighborhood: name }) =>
              name ? [<option value={name} key={name}>{name}</option>] : [],
            )}
          </select>
          <button className="admin-quiet-button" type="submit">Filtrar</button>
        </form>

        {properties.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Inmueble</th>
                  <th>Colonia</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <span className="admin-table-title">{property.title || "Sin título"}</span>
                      <span className="admin-table-subtitle">
                        {property.publicCode} · {property.sourceReference ?? property.slug}
                      </span>
                      {property.status === "draft" && (
                        <span className="admin-table-subtitle">
                          Pendiente para publicar: {publicationIssues(property).join(", ") || "listo"}
                        </span>
                      )}
                    </td>
                    <td>{property.neighborhood || "—"}</td>
                    <td><span className="admin-status">{labels[property.status]}</span></td>
                    <td>{property.priceMxn === null ? "—" : `$${Number(property.priceMxn).toLocaleString("es-MX")}`}</td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/properties/${property.id}/edit`}>Editar</Link>
                        <Link href={`/admin/properties/${property.id}/preview`}>Previsualizar</Link>
                        {propertyStatusTransitions[property.status].map((next) => (
                          <form action={changePropertyStatus} className="admin-status-form" key={next}>
                            <input type="hidden" name="id" value={property.id} />
                            <input type="hidden" name="status" value={next} />
                            <button type="submit">{labels[next]}</button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty">No hay inmuebles que coincidan con estos filtros.</p>
        )}
      </section>
    </div>
  );
}
