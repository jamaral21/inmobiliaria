import type { PropertyFilters } from "@/lib/properties";
import { getPropertyZones } from "@/lib/property-repository";

export async function SearchForm({
  filters = {},
  variant = "catalog",
}: {
  filters?: PropertyFilters;
  variant?: "catalog" | "home";
}) {
  const zones = await getPropertyZones();
  const isHome = variant === "home";
  const bedroomsFilter = (
    <label>
      <span>{isHome ? "Recámaras" : "RECÁMARAS"}</span>
      <select
        name="recamaras"
        defaultValue={filters.bedrooms?.toString() ?? ""}
      >
        <option value="">Sin preferencia</option>
        <option value="1">1 o más</option>
        <option value="2">2 o más</option>
        <option value="3">3 o más</option>
        <option value="4">4 o más</option>
      </select>
    </label>
  );

  return (
    <form
      className={`search-form figma-search-panel${isHome ? " home-search-form" : ""}`}
      action="/propiedades"
      method="get"
    >
      <label>
        <span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {isHome ? "¿DÓNDE QUIERES VIVIR?" : "ZONA"}
        </span>
        <select name="zona" defaultValue={filters.zone ?? ""}>
          <option value="">Todas las zonas</option>
          {zones.map((zone) => (
            <option value={zone} key={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      {!isHome && (
        <label>
          <span>TIPO DE PROPIEDAD</span>
          <select name="tipo" defaultValue={filters.type ?? ""}>
            <option value="">Casa o departamento</option>
            <option value="Casa">Casa</option>
            <option value="Departamento">Departamento</option>
          </select>
        </label>
      )}
      {!isHome && bedroomsFilter}
      <label>
        <span>PRESUPUESTO MÁXIMO</span>
        <select
          name="precioMax"
          defaultValue={filters.maxPrice?.toString() ?? ""}
        >
          <option value="">Sin límite</option>
          <option value="3000000">Hasta $3,000,000</option>
          <option value="4000000">Hasta $4,000,000</option>
          <option value="5000000">Hasta $5,000,000</option>
          <option value="7000000">Hasta $7,000,000</option>
        </select>
      </label>
      {isHome && bedroomsFilter}
      <button className="button button-primary search-submit" type="submit">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        Buscar propiedades
      </button>
    </form>
  );
}
