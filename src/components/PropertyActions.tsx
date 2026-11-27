"use client";

import { useFigmaExperience } from "@/components/FigmaExperienceProvider";

export function PropertyActions({
  propertyName,
  location,
  price,
  variant = "sidebar",
}: {
  propertyName: string;
  location: string;
  price?: string;
  variant?: "sidebar" | "mobile";
}) {
  const { openVisit, openContact, openTour } = useFigmaExperience();

  if (variant === "mobile") {
    return (
      <div className="pdp-mobile-visit">
        {price && (
          <span>
            <small>PRECIO DE MUESTRA</small>
            <strong>{price}</strong>
          </span>
        )}
        <button
          className="button button-primary figma-primary"
          type="button"
          onClick={() => openVisit(propertyName, location)}
        >
          Solicitar visita <span aria-hidden="true">↗</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="button button-primary figma-primary button-full"
        type="button"
        onClick={() => openVisit(propertyName, location)}
      >
        Solicitar visita <span aria-hidden="true">↗</span>
      </button>
      <button
        className="button button-light figma-secondary button-full"
        type="button"
        onClick={() => openContact(propertyName, location)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m4 20 1-4a8.5 8.5 0 1 1 3 3l-4 1Z" />
          <path d="M9 7c-3 3 5 11 7 7l-3-2-1 1-2-2 1-1-2-3Z" />
        </svg>
        Consultar por WhatsApp
      </button>
      <button
        className="pdp-tour-link"
        type="button"
        onClick={() => openTour(propertyName, location)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9c-4 6 20 6 16 0M17 5l4 4-4 4M5 17h14" />
          <circle cx="12" cy="7" r="2" />
        </svg>
        Ver recorrido 360°
      </button>
    </>
  );
}

export function PropertyTourButton({
  propertyName,
  location,
}: {
  propertyName: string;
  location: string;
}) {
  const { openTour } = useFigmaExperience();
  return (
    <button
      className="pdp-tour-note"
      type="button"
      onClick={() => openTour(propertyName, location)}
    >
      <span className="pdp-tour-icon" aria-hidden="true">360°</span>
      <span>
        <strong>Recorrido inmersivo · demo</strong>
        <small>Explora vistas ilustrativas de sala y cocina.</small>
      </span>
      <span className="pdp-tour-arrow" aria-hidden="true">↗</span>
    </button>
  );
}
