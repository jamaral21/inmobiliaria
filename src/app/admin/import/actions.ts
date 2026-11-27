"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  applyInventoryCsv,
  previewInventoryCsv,
} from "@/lib/inventory-import";

export async function previewCsv(csvText: string) {
  await requireAdmin();
  if (typeof csvText !== "string") {
    return { entries: [], issues: [{ row: 1, message: "El contenido CSV no es válido." }] };
  }
  return previewInventoryCsv(csvText);
}

export async function applyCsv(csvText: string) {
  await requireAdmin();
  if (typeof csvText !== "string") {
    return {
      entries: [],
      issues: [{ row: 1, message: "El contenido CSV no es válido." }],
      imported: 0,
    };
  }

  const result = await applyInventoryCsv(csvText);
  if (result.imported) {
    revalidatePath("/admin");
    revalidatePath("/propiedades");
    revalidatePath("/sitemap.xml");
    revalidatePath("/");
  }
  return result;
}
