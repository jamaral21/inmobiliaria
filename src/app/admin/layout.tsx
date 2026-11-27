import type { Metadata } from "next";
import { AdminSignOutButton } from "@/components/AdminAuthButton";
import { getAdminSession } from "@/lib/admin-auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Administración de inventario",
  robots: { index: false, follow: false, noarchive: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  return (
    <div className="admin-shell">
      {session && (
        <header className="admin-topbar">
          <a href="/admin" className="admin-brand">Habita <span>· inventario</span></a>
          <div className="admin-identity">
            <span>{session.user.email}</span>
            <AdminSignOutButton />
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
