"use client";

import Image from "next/image";
import {
  useFigmaExperience,
  type GalleryImage,
} from "@/components/FigmaExperienceProvider";
import type { PropertyPhoto } from "@/lib/properties";

export function PropertyGallery({
  photos,
  title,
  publicCode,
  statusLabel,
}: {
  photos: PropertyPhoto[];
  title: string;
  publicCode: string;
  statusLabel: string;
}) {
  const { openGallery } = useFigmaExperience();
  const images: GalleryImage[] = photos.map((photo, index) => ({
    ...photo,
    label: index === 0 ? "Vista principal" : `Foto ${index + 1}`,
  }));

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
            unoptimized
            sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 50vw, 35vw"}
          />
          <span className="pdp-image-caption">
            {index === 0 ? statusLabel : item.label}
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
