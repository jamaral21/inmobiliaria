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
        <Link className="brand" href="/" aria-label="Habita Querétaro, inicio">
          <span className="brand-word">
            habita<span className="brand-dot">.</span>
          </span>
          <span className="brand-place">QUERÉTARO</span>
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
