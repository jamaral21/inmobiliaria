"use client";

import Image from "next/image";
import {
  useFigmaExperience,
  type GalleryImage,
} from "@/components/FigmaExperienceProvider";

const referenceImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85",
    alt: "Interior ilustrativo de una sala",
    label: "Sala · Imagen de referencia",
  },
  {
    src: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=85",
    alt: "Interior ilustrativo de una cocina",
    label: "Cocina · Imagen de referencia",
  },
];

export function PropertyGallery({
  image,
  imageAlt,
  title,
  publicCode,
  statusLabel,
}: {
  image: string;
  imageAlt: string;
  title: string;
  publicCode: string;
  statusLabel: string;
}) {
  const { openGallery } = useFigmaExperience();
  const images: GalleryImage[] = [
    { src: image, alt: `${imageAlt} · imagen de demostración`, label: "Vista principal" },
    ...referenceImages,
  ];

  function showGallery(index: number) {
    openGallery(title, publicCode, images, index);
  }

  return (
    <div className="pdp-gallery" aria-label={`Fotos de ${title}`}>
      {images.map((item, index) => (
        <button
          className={`pdp-gallery-image pdp-gallery-image-${index}`}
          key={item.src}
          type="button"
          onClick={() => showGallery(index)}
          aria-label={`Ampliar foto ${index + 1} de ${title}`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            priority={index === 0}
            sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 50vw, 35vw"}
          />
          <span className="pdp-image-caption">
            {index === 0 ? statusLabel : "Foto de referencia · demo"}
          </span>
        </button>
      ))}
      <button
        className="pdp-gallery-all"
        type="button"
        onClick={() => showGallery(0)}
      >
        Ver galería · {images.length} fotos
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
