import type { PropertyFilters } from "@/lib/properties";
import { getPropertyZones } from "@/lib/properties";

export function SearchForm({ filters = {} }: { filters?: PropertyFilters }) {
  return (
    <form className="search-form" action="/propiedades" method="get">
      <label>
        Zona
        <select name="zona" defaultValue={filters.zone ?? ""}>
          <option value="">Todas las zonas</option>
          {getPropertyZones().map((zone) => (
            <option value={zone} key={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo
        <select name="tipo" defaultValue={filters.type ?? ""}>
          <option value="">Casa o departamento</option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
        </select>
      </label>
      <label>
        Recámaras
        <select
          name="recamaras"
          defaultValue={filters.bedrooms?.toString() ?? ""}
        >
          <option value="">Cualquiera</option>
          <option value="1">1 o más</option>
          <option value="2">2 o más</option>
          <option value="3">3 o más</option>
          <option value="4">4 o más</option>
        </select>
      </label>
      <label>
        Presupuesto máximo
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
      <button className="button button-primary search-submit" type="submit">
        Buscar propiedades
      </button>
    </form>
  );
}
