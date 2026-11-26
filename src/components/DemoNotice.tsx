export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-notice${compact ? " demo-notice-compact" : ""}`}>
      <span className="demo-notice-dot" aria-hidden="true" />
      <span>
        <strong>Catálogo de demostración.</strong> Inmuebles, precios, fotos y
        disponibilidad son ficticios; no representan una oferta real.
      </span>
    </div>
  );
}
