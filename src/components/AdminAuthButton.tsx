"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AdminSignInButton() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
      });
      if (!result.error) return;
      setError("No se pudo iniciar sesión. Verifica la cuenta autorizada e inténtalo de nuevo.");
    } catch {
      setError("No se pudo iniciar sesión. Verifica la configuración e inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="button button-primary admin-button" disabled={pending} onClick={signIn}>
        {pending ? "Conectando…" : "Continuar con Google"}
      </button>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </>
  );
}

export function AdminSignOutButton() {
  const router = useRouter();

  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) {
      window.alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      return;
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className="admin-quiet-button" type="button" onClick={signOut}>
      Cerrar sesión
    </button>
  );
}
