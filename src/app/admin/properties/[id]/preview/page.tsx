import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { parseStoredPhotos } from "@/lib/admin-inventory";
import { prisma } from "@/lib/prisma";

type RouteParams = Promise<{ id: string }>;

export default async function PreviewPropertyPage({ params }: { params: RouteParams }) {
  await requireAdmin();
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) notFound();
  const photos = parseStoredPhotos(property.photos);

  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">Previsualización privada · {property.status}</p>
          <h1>{property.title || "Sin título"}</h1>
        </div>
        <Link className="admin-link" href={`/admin/properties/${id}/edit`}>Editar ficha</Link>
      </div>
      <section className="admin-form-card">
        <p><strong>{property.publicCode}</strong> · {property.slug}</p>
        <p>{property.type} · {property.operation === "sale" ? "Venta" : "Renta"} · {property.neighborhood || "Sin colonia"}</p>
        <p>{property.priceMxn === null ? "Sin precio" : `$${Number(property.priceMxn).toLocaleString("es-MX")} MXN`}</p>
        <p>{property.description || "Sin descripción"}</p>
        <div className="admin-preview-gallery">
          {photos.map((photo) => (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={800}
              height={600}
              unoptimized
              key={photo.src}
            />
          ))}
        </div>
        {property.tourUrl && <p>Recorrido 360°: <a className="admin-link" href={property.tourUrl} rel="noreferrer">Abrir enlace</a></p>}
        <p><strong>Privado:</strong> {property.authorizationReference || "Sin referencia de autorización"}</p>
        {property.partnerNotes && <p><strong>Notas:</strong> {property.partnerNotes}</p>}
      </section>
    </div>
  );
}
