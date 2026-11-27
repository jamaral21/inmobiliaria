import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSignInButton } from "@/components/AdminAuthButton";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Acceso al inventario",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const configured = Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.BETTER_AUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <section className="admin-login">
      <div className="admin-login-card">
        <p className="admin-eyebrow">Acceso privado</p>
        <h1>Administrar inventario</h1>
        <p>Inicia sesión con la cuenta de Google configurada para administrar este catálogo.</p>
        {configured ? (
          <AdminSignInButton />
        ) : (
          <p className="admin-error" role="status">
            El acceso aún no está configurado. Contacta al responsable técnico.
          </p>
        )}
      </div>
    </section>
  );
}
