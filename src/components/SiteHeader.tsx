"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFigmaExperience } from "@/components/FigmaExperienceProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const { openContact } = useFigmaExperience();
  const [menuOpen, setMenuOpen] = useState(false);
  const catalogActive = pathname.startsWith("/propiedades") || pathname.startsWith("/casas-en-venta");

  return (
    <header className="site-header figma-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Habita Querétaro, inicio">
          <span className="brand-word">
            habita<span className="brand-dot">.</span>
          </span>
          <span className="brand-place">QUERÉTARO</span>
        </Link>
        <nav
          className={`desktop-nav figma-nav${menuOpen ? " open" : ""}`}
          id="primary-navigation"
          aria-label="Navegación principal"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/propiedades"
            aria-current={catalogActive ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Catálogo de propiedades
          </Link>
          <Link href="/#nosotros" onClick={() => setMenuOpen(false)}>
            ¿Por qué Habita?
          </Link>
        </nav>
        <button
          className="button secondary figma-header-contact"
          type="button"
          onClick={() => {
            setMenuOpen(false);
            openContact();
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m4 20 1-4a8.5 8.5 0 1 1 3 3l-4 1Z" />
            <path d="M9 7c-3 3 5 11 7 7l-3-2-1 1-2-2 1-1-2-3Z" />
          </svg>
          <span>Hablemos</span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          className="figma-menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="m6 6 12 12M6 18 18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
