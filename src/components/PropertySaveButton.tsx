"use client";

import { useFigmaExperience } from "@/components/FigmaExperienceProvider";

export function PropertySaveButton({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const { favorites, toggleFavorite } = useFigmaExperience();
  const saved = favorites.includes(propertyId);

  return (
    <button
      className={`pdp-save-button${saved ? " is-saved" : ""}`}
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? "Quitar" : "Guardar"} ${propertyName} ${saved ? "de" : "en"} favoritos`}
      onClick={() => toggleFavorite(propertyId)}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      <span>{saved ? "Guardada" : "Guardar propiedad"}</span>
    </button>
  );
}
