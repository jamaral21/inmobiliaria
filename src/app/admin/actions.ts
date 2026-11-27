"use server";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PropertyStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import {
  parsePropertyForm,
  canTransitionPropertyStatus,
  publicationIssues,
  slugify,
} from "@/lib/admin-inventory";
import { prisma } from "@/lib/prisma";

function adminErrorUrl(error: unknown, path: string) {
  const message = error instanceof Error ? error.message : "No se pudo guardar el inmueble.";
  return `${path}?error=${encodeURIComponent(message)}`;
}

function revalidateInventory() {
  revalidatePath("/admin");
  revalidatePath("/propiedades");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  revalidatePath("/casas-en-venta/[zona]", "page");
}

export async function createDraft() {
  await requireAdmin();
  const id = randomUUID();
  const property = await prisma.property.create({
    data: {
      id,
      publicCode: `QRO-${id.slice(0, 8).toUpperCase()}`,
      slug: `borrador-${id}`,
      title: "",
      description: "",
      type: "Casa",
      status: "draft",
      priceMxn: null,
      municipality: null,
      neighborhood: null,
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      amenities: [],
      photos: [],
    },
    select: { id: true },
  });
  redirect(`/admin/properties/${property.id}/edit`);
}

export async function saveProperty(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const path = `/admin/properties/${encodeURIComponent(id)}/edit`;
  try {
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("El inmueble no es válido.");
    const input = parsePropertyForm(form);
    if (!input.slug) throw new Error("El slug es obligatorio.");
    const { approximateLocation, ...propertyInput } = input;
    const saveMode = form.get("saveMode");
    const current = await prisma.property.findUnique({ where: { id } });
    if (!current) throw new Error("No se encontró el inmueble.");
    const nextStatus: PropertyStatus =
      saveMode === "draft" ? "draft" : current.status;

    await prisma.$transaction(async (tx) => {
      const duplicateSlug = await tx.property.findUnique({ where: { slug: input.slug } });
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw new Error("Ese slug ya está asignado a otro inmueble.");
      }

      const existingRedirect = await tx.propertySlugRedirect.findUnique({
        where: { slug: input.slug },
      });
      if (existingRedirect && existingRedirect.propertyId !== id) {
        throw new Error("Ese slug está reservado por una redirección anterior.");
      }
      if (existingRedirect) {
        await tx.propertySlugRedirect.delete({ where: { slug: input.slug } });
      }

      const updated = await tx.property.update({
        where: { id },
        data: {
          ...propertyInput,
          approximateLocation: approximateLocation ?? Prisma.DbNull,
          slug: input.slug || slugify(input.title) || `inmueble-${id}`,
          status: nextStatus,
        },
      });

      if (
        current.slug !== updated.slug &&
        current.status !== "draft" &&
        current.status !== "withdrawn"
      ) {
        await tx.propertySlugRedirect.upsert({
          where: { slug: current.slug },
          create: { slug: current.slug, propertyId: id },
          update: { propertyId: id },
        });
      }

      if (nextStatus !== "draft" && nextStatus !== "withdrawn") {
        const issues = publicationIssues(updated);
        if (issues.length) {
          throw new Error(`Completa antes de guardar: ${issues.join(", ")}.`);
        }
      }
    });

    revalidateInventory();
    redirect(`${path}?saved=1`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    redirect(adminErrorUrl(error, path));
  }
}

export async function changePropertyStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const requested = String(form.get("status") ?? "") as PropertyStatus;
  if (!/^[a-f0-9-]{36}$/i.test(id)) redirect("/admin?error=Inmueble%20inv%C3%A1lido");

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) redirect("/admin?error=No%20se%20encontr%C3%B3%20el%20inmueble");
  if (!canTransitionPropertyStatus(property.status, requested)) {
    redirect("/admin?error=Transici%C3%B3n%20de%20estado%20no%20permitida");
  }
  if (requested === "available") {
    const issues = publicationIssues(property);
    if (issues.length) {
      redirect(
        `/admin/properties/${id}/edit?error=${encodeURIComponent(`Completa antes de publicar: ${issues.join(", ")}.`)}`,
      );
    }
  }

  await prisma.property.update({ where: { id }, data: { status: requested } });
  revalidateInventory();
  redirect("/admin?saved=1");
}
