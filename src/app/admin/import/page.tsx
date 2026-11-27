import Link from "next/link";
import { AdminCsvImportForm } from "@/components/AdminCsvImportForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function ImportInventoryPage() {
  await requireAdmin();
  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Carga inicial · importación idempotente</p>
          <h1>Importar inventario CSV</h1>
        </div>
        <Link className="admin-link" href="/admin">Volver al inventario</Link>
      </div>
      <section className="admin-panel">
        <p>
          Usa una referencia externa estable por inmueble. Las filas nuevas se crean como borradores;
          las existentes se actualizan sin cambiar su estado. Reimportar el mismo archivo no duplica
          registros.
        </p>
        <p className="admin-field-help">
          Columnas requeridas: sourceReference, slug, title, description, type, operation, priceMxn,
          municipality, neighborhood, bedrooms, bathrooms, parkingSpaces, constructionAreaSqm,
          landAreaSqm, amenities, photos, tourUrl, authorizationReference y partnerNotes. Usa
          amenidades separadas por | y fotos como URL|texto alternativo;URL|texto alternativo.
          Envuelve entre comillas CSV los valores que contengan comas.
        </p>
        <AdminCsvImportForm />
      </section>
    </div>
  );
}
