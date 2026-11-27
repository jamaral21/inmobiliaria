import Link from "next/link";
import { notFound } from "next/navigation";
import { saveProperty } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { parseStoredPhotos } from "@/lib/admin-inventory";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ saved?: string; error?: string }>;
type RouteParams = Promise<{ id: string }>;

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) notFound();

  const photos = parseStoredPhotos(property.photos)
    .map(({ src, alt }) => `${src}\t${alt}`)
    .join("\n");
  const numberValue = (value: { toString(): string } | number | null) =>
    value === null ? "" : value.toString();

  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">{property.publicCode} · {property.status}</p>
          <h1>{property.title || "Nuevo borrador"}</h1>
        </div>
        <Link className="admin-link" href="/admin">Volver al inventario</Link>
      </div>
      {query.saved && <p className="admin-message" role="status">Ficha guardada.</p>}
      {query.error && <p className="admin-error" role="alert">{query.error}</p>}

      <form className="admin-form-card" action={saveProperty}>
        <input type="hidden" name="id" value={property.id} />
        <div className="admin-form-grid">
          <label className="admin-field">
            Título
            <input name="title" defaultValue={property.title} maxLength={160} />
          </label>
          <label className="admin-field">
            Slug
            <input name="slug" defaultValue={property.slug} maxLength={100} required />
            <span className="admin-field-help">Solo minúsculas, números y guiones.</span>
          </label>
          <label className="admin-field">
            Tipo
            <select name="type" defaultValue={property.type}>
              <option>Casa</option>
              <option>Departamento</option>
            </select>
          </label>
          <label className="admin-field">
            Operación
            <select name="operation" defaultValue={property.operation}>
              <option value="sale">Venta</option>
              <option value="rent">Renta</option>
            </select>
          </label>
          <label className="admin-field">
            Precio (MXN)
            <input name="priceMxn" type="number" min="0.01" step="0.01" defaultValue={numberValue(property.priceMxn)} />
          </label>
          <label className="admin-field">
            Municipio
            <input name="municipality" defaultValue={property.municipality ?? ""} maxLength={120} />
          </label>
          <label className="admin-field">
            Colonia
            <input name="neighborhood" defaultValue={property.neighborhood ?? ""} maxLength={120} />
          </label>
          <label className="admin-field">
            Recámaras
            <input name="bedrooms" type="number" min="0" step="1" defaultValue={numberValue(property.bedrooms)} />
          </label>
          <label className="admin-field">
            Baños
            <input name="bathrooms" type="number" min="0" step="0.5" defaultValue={numberValue(property.bathrooms)} />
          </label>
          <label className="admin-field">
            Estacionamientos
            <input name="parkingSpaces" type="number" min="0" step="1" defaultValue={numberValue(property.parkingSpaces)} />
          </label>
          <label className="admin-field">
            Construcción (m²)
            <input name="constructionAreaSqm" type="number" min="0" step="0.01" defaultValue={numberValue(property.constructionAreaSqm)} />
          </label>
          <label className="admin-field">
            Terreno (m²)
            <input name="landAreaSqm" type="number" min="0" step="0.01" defaultValue={numberValue(property.landAreaSqm)} />
          </label>
          <label className="admin-field admin-field-full">
            Descripción
            <textarea name="description" defaultValue={property.description} maxLength={10000} />
          </label>
          <label className="admin-field admin-field-full">
            Amenidades
            <input name="amenities" defaultValue={property.amenities.join(", ")} maxLength={2000} />
            <span className="admin-field-help">Separa las amenidades con comas.</span>
          </label>
          <label className="admin-field admin-field-full">
            Galería
            <textarea name="photos" defaultValue={photos} />
            <span className="admin-field-help">
              Una foto por renglón: URL HTTPS, tabulador y texto alternativo. La primera es portada;
              conserva los renglones existentes y reordénalos para cambiar la portada.
            </span>
          </label>
          <label className="admin-field admin-field-full">
            Recorrido 360° (opcional)
            <input name="tourUrl" type="url" defaultValue={property.tourUrl ?? ""} />
          </label>
          <label className="admin-field">
            Fecha de verificación
            <input
              name="verifiedAt"
              type="date"
              defaultValue={property.verifiedAt?.toISOString().slice(0, 10) ?? ""}
            />
          </label>
          <label className="admin-field admin-field-full">
            Ubicación aproximada (JSON opcional)
            <textarea
              name="approximateLocation"
              defaultValue={
                property.approximateLocation &&
                typeof property.approximateLocation === "object" &&
                !Array.isArray(property.approximateLocation)
                  ? JSON.stringify(property.approximateLocation, null, 2)
                  : ""
              }
            />
            <span className="admin-field-help">
              Usa latitude, longitude y label opcional. Las coordenadas se redondean a dos decimales.
            </span>
          </label>
          <label className="admin-field admin-field-full">
            Referencia de autorización (privada)
            <input name="authorizationReference" defaultValue={property.authorizationReference ?? ""} maxLength={300} />
          </label>
          <label className="admin-field admin-field-full">
            Notas del socio (privadas)
            <textarea name="partnerNotes" defaultValue={property.partnerNotes ?? ""} maxLength={5000} />
          </label>
        </div>
        <div className="admin-form-actions">
          <button type="submit" name="saveMode" value="save">Guardar cambios</button>
          <button type="submit" name="saveMode" value="draft">Guardar como borrador</button>
          <Link href={`/admin/properties/${property.id}/preview`}>Previsualizar ficha</Link>
        </div>
      </form>
    </div>
  );
}
