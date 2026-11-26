import Link from "next/link";

const links = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/casas-en-venta/juriquilla", label: "Zonas" },
  { href: "/vende-tu-casa", label: "Vende tu casa" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Casa Querétaro, inicio">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M4 15.5 16 5l12 10.5" />
              <path d="M8 14v13h16V14M13 27v-8h6v8" />
            </svg>
          </span>
          <span>
            <strong>casa</strong>
            <small>QUERÉTARO</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="button button-dark header-cta" href="/propiedades">
          Explorar casas
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Abrir navegación">Menú</summary>
          <nav aria-label="Navegación móvil">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
