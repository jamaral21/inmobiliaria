import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer figma-footer">
      <div className="container footer-main">
        <div className="footer-top">
          <Link className="brand footer-brand" href="/">
            <span className="brand-word">
              habita<span className="brand-dot">.</span>
            </span>
            <span className="brand-place">QUERÉTARO</span>
          </Link>
          <p>Un buen lugar cambia todo.</p>
          <Link className="text-link" href="/propiedades">
            Encuentra el tuyo <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Habita Querétaro.</span>
          <span>Propiedades en Querétaro</span>
          <div className="footer-links">
            <Link href="/vende-tu-casa">Vende tu casa</Link>
            <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
