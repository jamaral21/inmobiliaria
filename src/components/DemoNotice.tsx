export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-notice${compact ? " demo-notice-compact" : ""}`}>
      <span className="demo-notice-dot" aria-hidden="true" />
      <span>
        <strong>Contenido editorial de muestra.</strong> Confirma la disponibilidad y los datos de
        cada propiedad antes de tomar una decisión.
      </span>
    </div>
  );
}
