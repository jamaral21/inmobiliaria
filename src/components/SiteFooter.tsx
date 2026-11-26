import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-word">
              habita<span className="brand-dot">.</span>
            </span>
            <span className="brand-place">QUERÉTARO</span>
          </Link>
          <p>Un buen lugar cambia todo.</p>
        </div>
        <div className="footer-links">
          <Link href="/propiedades">Ver propiedades</Link>
          <Link href="/vende-tu-casa">Vende tu casa</Link>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Habita Querétaro.</span>
        <span>Catálogo demostrativo · datos ficticios</span>
      </div>
    </footer>
  );
}
