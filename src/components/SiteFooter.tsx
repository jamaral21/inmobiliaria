import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div>
          <Link className="brand footer-brand" href="/">
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
          <p>Un buen lugar para empezar a sentirte en casa.</p>
        </div>
        <div className="footer-links">
          <Link href="/propiedades">Ver propiedades</Link>
          <Link href="/vende-tu-casa">Vende tu casa</Link>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Casa Querétaro</span>
        <span>Vista de producto · datos de demostración</span>
      </div>
    </footer>
  );
}
