export type PropertyStatus =
  | "draft"
  | "available"
  | "reserved"
  | "sold"
  | "withdrawn";

export type Property = {
  id: string;
  publicCode: string;
  slug: string;
  title: string;
  description: string;
  type: "Casa" | "Departamento";
  status: PropertyStatus;
  price: number;
  zone: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  constructionArea?: number;
  landArea?: number;
  amenities: string[];
  image: string;
  imageAlt: string;
};

export const properties: Property[] = [
  {
    id: "demo-property-001",
    publicCode: "QRO-DEMO-001",
    slug: "casa-contemporanea-en-juriquilla",
    title: "Casa contemporánea con jardín en Juriquilla",
    description:
      "Espacios luminosos, jardín privado y distribución cómoda para la vida diaria. Datos e imágenes de ejemplo para validar el catálogo.",
    type: "Casa",
    status: "available",
    price: 4_850_000,
    zone: "Juriquilla",
    neighborhood: "Juriquilla",
    bedrooms: 3,
    bathrooms: 3.5,
    parkingSpaces: 2,
    constructionArea: 218,
    landArea: 260,
    amenities: ["Jardín", "Cocina equipada", "Cisterna"],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Casa contemporánea de dos niveles con jardín",
  },
  {
    id: "demo-property-002",
    publicCode: "QRO-DEMO-002",
    slug: "casa-familiar-en-el-refugio",
    title: "Casa familiar con terraza en El Refugio",
    description:
      "Casa de diseño cálido con terraza y áreas sociales integradas. Información ficticia, no representa una oferta real.",
    type: "Casa",
    status: "available",
    price: 3_690_000,
    zone: "El Refugio",
    neighborhood: "El Refugio",
    bedrooms: 3,
    bathrooms: 2.5,
    parkingSpaces: 2,
    constructionArea: 184,
    landArea: 160,
    amenities: ["Terraza", "Área de lavado", "Acceso controlado"],
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Fachada moderna de vivienda familiar",
  },
  {
    id: "demo-property-003",
    publicCode: "QRO-DEMO-003",
    slug: "casa-con-patio-en-milenio-iii",
    title: "Casa con patio y estudio en Milenio III",
    description:
      "Una distribución flexible con estudio en planta baja y patio privado. Ficha de demostración.",
    type: "Casa",
    status: "available",
    price: 5_250_000,
    zone: "Milenio III",
    neighborhood: "Milenio III",
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    constructionArea: 236,
    landArea: 210,
    amenities: ["Estudio", "Patio", "Cuarto de servicio"],
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Sala de una casa con acabados contemporáneos",
  },
  {
    id: "demo-property-004",
    publicCode: "QRO-DEMO-004",
    slug: "departamento-en-zibata",
    title: "Departamento con balcón en Zibatá",
    description:
      "Departamento de muestra con balcón y amenidades. Los datos se reemplazarán con inventario autorizado.",
    type: "Departamento",
    status: "available",
    price: 2_790_000,
    zone: "Zibatá",
    neighborhood: "Zibatá",
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 98,
    amenities: ["Balcón", "Elevador", "Alberca"],
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Interior luminoso de un departamento con ventanales",
  },
  {
    id: "demo-property-005",
    publicCode: "QRO-DEMO-005",
    slug: "casa-de-una-planta-en-cumbres-del-lago",
    title: "Casa de una planta en Cumbres del Lago",
    description:
      "Casa de ejemplo con espacios abiertos y patio para reuniones. Precio, ubicación y disponibilidad ficticios.",
    type: "Casa",
    status: "available",
    price: 6_150_000,
    zone: "Juriquilla",
    neighborhood: "Cumbres del Lago",
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 3,
    constructionArea: 252,
    landArea: 330,
    amenities: ["Una planta", "Jardín", "Paneles solares"],
    image:
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Casa de una planta con ventanales hacia el jardín",
  },
  {
    id: "demo-property-010",
    publicCode: "QRO-DEMO-010",
    slug: "casa-restaurada-en-centro-sur",
    title: "Casa restaurada con patio en Centro Sur",
    description:
      "Una vivienda de muestra con patio interior y espacios renovados. Datos ficticios para pruebas.",
    type: "Casa",
    status: "available",
    price: 4_150_000,
    zone: "Centro Sur",
    neighborhood: "Centro Sur",
    bedrooms: 3,
    bathrooms: 2.5,
    parkingSpaces: 2,
    constructionArea: 192,
    landArea: 225,
    amenities: ["Patio interior", "Estudio", "Cocina equipada"],
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Casa de muestra restaurada con patio",
  },
  {
    id: "demo-property-011",
    publicCode: "QRO-DEMO-011",
    slug: "departamento-con-terraza-en-zibata",
    title: "Departamento con terraza en Zibatá",
    description:
      "Departamento de muestra con espacios abiertos y terraza privada. Precio y disponibilidad ficticios.",
    type: "Departamento",
    status: "available",
    price: 3_120_000,
    zone: "Zibatá",
    neighborhood: "Zibatá",
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 112,
    amenities: ["Terraza", "Elevador", "Bodega"],
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Interior de departamento con terraza",
  },
  {
    id: "demo-property-006",
    publicCode: "QRO-DEMO-006",
    slug: "casa-reservada-demo",
    title: "Casa de muestra con estado reservado",
    description:
      "Ficha de demostración para validar estados. No es una oferta comercial.",
    type: "Casa",
    status: "reserved",
    price: 3_250_000,
    zone: "El Refugio",
    neighborhood: "El Refugio",
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 170,
    landArea: 145,
    amenities: ["Jardín"],
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Vivienda de muestra en estado reservado",
  },
  {
    id: "demo-property-007",
    publicCode: "QRO-DEMO-007",
    slug: "casa-vendida-demo",
    title: "Casa de muestra con estado vendida",
    description:
      "Ficha de demostración para validar estados. No es una oferta comercial.",
    type: "Casa",
    status: "sold",
    price: 3_250_000,
    zone: "Juriquilla",
    neighborhood: "Juriquilla",
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 170,
    landArea: 145,
    amenities: ["Jardín"],
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Vivienda de muestra en estado vendida",
  },
  {
    id: "demo-property-008",
    publicCode: "QRO-DEMO-008",
    slug: "casa-borrador-demo",
    title: "Ficha interna en borrador",
    description: "Esta ficha no debe aparecer en páginas públicas.",
    type: "Casa",
    status: "draft",
    price: 1_000_000,
    zone: "Juriquilla",
    neighborhood: "Juriquilla",
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    constructionArea: 90,
    amenities: [],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Imagen de ficha interna",
  },
  {
    id: "demo-property-009",
    publicCode: "QRO-DEMO-009",
    slug: "casa-retirada-demo",
    title: "Ficha interna retirada",
    description: "Esta ficha no debe aparecer en páginas públicas.",
    type: "Casa",
    status: "withdrawn",
    price: 1_000_000,
    zone: "Juriquilla",
    neighborhood: "Juriquilla",
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    constructionArea: 90,
    amenities: [],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    imageAlt: "Imagen de ficha interna",
  },
];

export type PropertyFilters = {
  zone?: string;
  type?: string;
  bedrooms?: number;
  maxPrice?: number;
};

export const catalogPageSize = 6;

export function filterAvailableProperties(
  inventory: Property[],
  filters: PropertyFilters = {},
) {
  return inventory.filter((property) => {
    if (property.status !== "available") return false;
    if (filters.zone && property.zone !== filters.zone) return false;
    if (filters.type && property.type !== filters.type) return false;
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    return true;
  });
}

export function paginateProperties(
  inventory: Property[],
  requestedPage: number,
  pageSize = catalogPageSize,
) {
  const totalPages = Math.ceil(inventory.length / pageSize);
  const currentPage = totalPages
    ? Math.min(Math.max(Math.floor(requestedPage) || 1, 1), totalPages)
    : 1;
  const firstIndex = inventory.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastIndex = Math.min(currentPage * pageSize, inventory.length);

  return {
    items: inventory.slice(firstIndex - 1, lastIndex),
    currentPage,
    totalPages,
    totalCount: inventory.length,
    firstIndex,
    lastIndex,
  };
}

export function findPublicProperty(slug: string) {
  return properties.find(
    (property) =>
      property.slug === slug &&
      ["available", "reserved", "sold"].includes(property.status),
  );
}

export function getIndexableProperties() {
  return properties.filter((property) => property.status === "available");
}

export function getPropertyZones() {
  return [...new Set(getIndexableProperties().map((property) => property.zone))];
}
