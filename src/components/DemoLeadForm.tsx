"use client";

import { useRef, useState, type FormEvent } from "react";

export function DemoLeadForm({ propertyCode }: { propertyCode?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleDemoClick() {
    if (formRef.current?.reportValidity()) {
      setSubmitted(true);
    }
  }

  return (
    <section className="lead-panel" id="solicitar-visita">
      <div className="lead-panel-copy">
        <span className="eyebrow">Siguiente paso</span>
        <h2>{propertyCode ? "¿Te gustaría conocerla?" : "Hablemos de tu casa"}</h2>
        <p>
          {propertyCode
            ? "En el sitio final podrás solicitar una visita con el equipo inmobiliario."
            : "Comparte tus datos para conocer el proceso de promoción de tu propiedad."}
        </p>
        <p className="form-demo-note">
          Demostración: este formulario no envía ni guarda información.
        </p>
      </div>
      <form ref={formRef} className="lead-form" method="post" onSubmit={handleSubmit}>
        {propertyCode && (
          <input type="hidden" name="propertyCode" value={propertyCode} />
        )}
        <label>
          Nombre
          <input autoComplete="name" name="name" placeholder="Tu nombre" required />
        </label>
        <label>
          Teléfono o correo
          <input
            autoComplete="email"
            name="contact"
            placeholder="¿Cómo te contactamos?"
            required
          />
        </label>
        <label>
          Mensaje <span className="optional">(opcional)</span>
          <textarea
            name="message"
            placeholder={propertyCode ? "¿Qué te gustaría saber?" : "Cuéntanos un poco más"}
            rows={3}
          />
        </label>
        <label className="consent-label">
          <input type="checkbox" required />
          <span>Confirmo que entiendo que es una demostración y no enviaré datos reales.</span>
        </label>
        <button className="button button-dark" type="button" onClick={handleDemoClick}>
          Probar formulario
        </button>
        {submitted && (
          <p className="demo-result" role="status" aria-live="polite">
            Demo solamente: no se envió ni guardó tu información y no se creó
            una solicitud.
          </p>
        )}
      </form>
    </section>
  );
}
