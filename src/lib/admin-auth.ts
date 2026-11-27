import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-identity";
import { getAuth } from "@/lib/auth";

export async function getAdminSession() {
  if (
    !process.env.ADMIN_EMAIL?.trim() ||
    !process.env.BETTER_AUTH_SECRET ||
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !(process.env.BETTER_AUTH_URL || process.env.SITE_URL)
  ) {
    return null;
  }

  const session = await getAuth().api.getSession({ headers: await headers() });
  return isAdminSession(session) ? session : null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
