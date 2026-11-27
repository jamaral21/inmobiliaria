"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

export type GalleryImage = {
  src: string;
  alt: string;
  label: string;
};

type ModalKind = "visit" | "gallery" | "tour" | "whatsapp";
type ModalState = {
  kind: ModalKind;
  propertyName: string;
  location: string;
  publicCode?: string;
  images?: GalleryImage[];
};

type ExperienceContextValue = {
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  openVisit: (propertyName?: string, location?: string) => void;
  openGallery: (
    propertyName: string,
    publicCode: string,
    images: GalleryImage[],
    initialIndex?: number,
  ) => void;
  openTour: (propertyName: string, location?: string) => void;
  openContact: (propertyName?: string, location?: string) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);
const interior =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85";
const kitchen =
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=85";
const defaultName = "las casas disponibles";

function Icon({
  name,
  size = 20,
}: {
  name: "arrow" | "check" | "close" | "whatsapp" | "360";
  size?: number;
}) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    whatsapp: (
      <>
        <path d="m4 20 1-4a8.5 8.5 0 1 1 3 3l-4 1Z" />
        <path d="M9 7c-3 3 5 11 7 7l-3-2-1 1-2-2 1-1-2-3Z" />
      </>
    ),
    "360": (
      <>
        <path d="M4 9c-4 6 20 6 16 0M17 5l4 4-4 4M5 17h14" />
        <circle cx="12" cy="7" r="2" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function useFigmaExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useFigmaExperience must be used within FigmaExperienceProvider");
  }
  return context;
}

export function FigmaExperienceProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [tourPosition, setTourPosition] = useState(50);
  const [room, setRoom] = useState<"Sala" | "Cocina">("Sala");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (modal) {
      if (!dialog?.open) {
        const activeElement = document.activeElement;
        previousFocus.current =
          activeElement instanceof HTMLElement ? activeElement : null;
        dialog?.showModal();
      }
      document.body.style.overflow = "hidden";
    } else {
      if (dialog?.open) dialog.close();
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites((current) =>
      current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId],
    );
  }, []);

  const openVisit = useCallback(
    (propertyName = defaultName, location = "Querétaro") => {
      setSubmitted(false);
      setModal({ kind: "visit", propertyName, location });
    },
    [],
  );

  const openGallery = useCallback(
    (
      propertyName: string,
      publicCode: string,
      images: GalleryImage[],
      initialIndex = 0,
    ) => {
      setGalleryIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setModal({ kind: "gallery", propertyName, publicCode, location: "", images });
    },
    [],
  );

  const openTour = useCallback((propertyName: string, location = "Querétaro") => {
    setRoom("Sala");
    setTourPosition(50);
    setModal({ kind: "tour", propertyName, location });
  }, []);

  const openContact = useCallback((propertyName = defaultName, location = "Querétaro") => {
    setModal({ kind: "whatsapp", propertyName, location });
  }, []);

  const contextValue = useMemo(
    () => ({ favorites, toggleFavorite, openVisit, openGallery, openTour, openContact }),
    [favorites, toggleFavorite, openVisit, openGallery, openTour, openContact],
  );

  const galleryImages = modal?.images ?? [];
  const selectedImage = galleryImages[galleryIndex];

  function submitDemoForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <ExperienceContext.Provider value={contextValue}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={
          modal?.kind === "visit"
            ? "Solicitar visita de demostración"
            : modal?.kind === "gallery"
              ? "Galería de propiedad"
              : modal?.kind === "tour"
                ? "Recorrido demostrativo"
                : "Contacto de demostración"
        }
        onCancel={() => setModal(null)}
        onClose={() => {
          setModal(null);
          setSubmitted(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}
        className={`figma-modal${modal?.kind === "gallery" || modal?.kind === "tour" ? " figma-modal-wide" : ""}`}
      >
        <button
          className="figma-modal-close"
          type="button"
          onClick={() => setModal(null)}
          aria-label="Cerrar"
        >
          <Icon name="close" />
        </button>
        {modal?.kind === "visit" &&
          (submitted ? (
            <div className="figma-success-state">
              <span className="figma-success-icon">
                <Icon name="check" size={30} />
              </span>
              <div className="eyebrow">UN NUEVO COMIENZO · DEMO</div>
              <h2>¡Así empieza tu próxima historia!</h2>
              <p>
                El formulario para <strong>{modal.propertyName}</strong> se completó en esta
                demostración.
              </p>
              <p className="figma-demo-notice">
                No se enviaron ni guardaron datos y no se agendó una visita. En un servicio real, un
                asesor confirmaría contigo la disponibilidad.
              </p>
              <button
                className="button button-primary figma-primary"
                type="button"
                onClick={() => setModal(null)}
              >
                Seguir explorando <Icon name="arrow" size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="eyebrow">CONOCE TU POSIBLE HOGAR · DEMO</div>
              <h2>
                Vamos a <em>conocernos.</em>
              </h2>
              <p className="figma-modal-intro">
                Solicita información sobre {modal.propertyName}, {modal.location}.
              </p>
              <form className="figma-visit-form" onSubmit={submitDemoForm}>
                <label>
                  Nombre completo
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="¿Cómo te llamas?"
                  />
                </label>
                <div className="figma-form-row">
                  <label>
                    Correo electrónico
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </label>
                  <label>
                    Celular
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      pattern="[+]?[0-9 ]{10,19}"
                      title="Ingresa un teléfono válido de 10 a 20 caracteres."
                      required
                      placeholder="442 123 4567"
                    />
                  </label>
                </div>
                <div className="figma-form-row">
                  <label>
                    ¿Qué día te gustaría?
                    <input
                      type="date"
                      required
                      onFocus={(event) => {
                        const today = new Date();
                        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                        event.currentTarget.min = today.toISOString().slice(0, 10);
                      }}
                    />
                  </label>
                  <label>
                    Horario preferido
                    <select required defaultValue="">
                      <option value="" disabled>
                        Elige un horario
                      </option>
                      <option>09:00 – 12:00</option>
                      <option>12:00 – 15:00</option>
                      <option>15:00 – 18:00</option>
                    </select>
                  </label>
                </div>
                <label>
                  ¿Algo que debamos saber? <span className="figma-optional">(opcional)</span>
                  <textarea rows={2} maxLength={500} placeholder="Cuéntanos qué buscas…" />
                </label>
                <label className="figma-checkbox-label">
                  <input type="checkbox" required />
                  <span>
                    Entiendo que esto es una demostración y no agenda una visita real. No ingresaré
                    datos personales reales.
                  </span>
                </label>
                <button type="submit" className="button button-primary figma-primary">
                  Probar formulario <Icon name="arrow" size={18} />
                </button>
                <p className="figma-form-note">
                  Demostración: tus datos no se envían ni se almacenan.
                </p>
              </form>
            </>
          ))}
        {modal?.kind === "gallery" && selectedImage && (
          <div className="figma-gallery-modal">
            <div className="eyebrow">
              {modal.propertyName} · GALERÍA · {modal.publicCode}
            </div>
            <Image
              className="figma-full-image"
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1600}
              height={1000}
              unoptimized
              priority
            />
            <div className="figma-gallery-controls">
              <button
                className="figma-round-button"
                type="button"
                aria-label="Foto anterior"
                onClick={() =>
                  setGalleryIndex((current) => (current + galleryImages.length - 1) % galleryImages.length)
                }
              >
                ←
              </button>
              <span>
                {galleryIndex + 1} / {galleryImages.length} · {selectedImage.label}
              </span>
              <button
                className="figma-round-button"
                type="button"
                aria-label="Siguiente foto"
                onClick={() => setGalleryIndex((current) => (current + 1) % galleryImages.length)}
              >
                →
              </button>
            </div>
            <p className="figma-form-note">
              Imágenes ficticias de referencia; no representan una propiedad real.
            </p>
          </div>
        )}
        {modal?.kind === "tour" && (
          <div className="figma-tour-modal">
            <div className="eyebrow">RECORRIDO 360° · DEMOSTRACIÓN</div>
            <h2>Explora {modal.propertyName}</h2>
            <div
              className="figma-panorama"
              style={{
                backgroundImage: `url(${room === "Sala" ? interior : kitchen})`,
                backgroundPosition: `${tourPosition}% center`,
              }}
            >
              <span className="figma-panorama-label">
                <Icon name="360" size={20} />
                {room} · vista ilustrativa
              </span>
            </div>
            <label className="figma-tour-slider">
              Desliza para explorar la vista
              <input
                type="range"
                min="0"
                max="100"
                value={tourPosition}
                onChange={(event) => setTourPosition(Number(event.target.value))}
              />
            </label>
            <div className="figma-room-tabs" aria-label="Elegir habitación">
              {(["Sala", "Cocina"] as const).map((nextRoom) => (
                <button
                  className={room === nextRoom ? "selected" : ""}
                  type="button"
                  key={nextRoom}
                  aria-pressed={room === nextRoom}
                  onClick={() => {
                    setRoom(nextRoom);
                    setTourPosition(50);
                  }}
                >
                  {nextRoom}
                </button>
              ))}
            </div>
            <p className="figma-form-note">
              Simulación con imágenes de referencia; no es una captura 360° real de la propiedad.
            </p>
            <button
              className="button button-primary figma-primary"
              type="button"
              onClick={() => openVisit(modal.propertyName, modal.location)}
            >
              Me gustaría conocerla <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
        {modal?.kind === "whatsapp" && (
          <div className="figma-contact-modal">
            <span className="figma-success-icon">
              <Icon name="whatsapp" size={32} />
            </span>
            <div className="eyebrow">CONVERSEMOS · DEMO</div>
            <h2>
              Estamos para <em>acompañarte.</em>
            </h2>
            <p>
              Esta demostración no tiene un número comercial de WhatsApp conectado. No se abrirá
              ninguna conversación ni se contactará a terceros.
            </p>
            <div className="figma-message-preview">
              Hola, me gustaría recibir información sobre {modal.propertyName}
              {modal.location ? ` en ${modal.location}` : ""}. ¿Podemos conocer las opciones?
            </div>
            <button
              className="button button-primary figma-primary"
              type="button"
              onClick={() => openVisit(modal.propertyName, modal.location)}
            >
              Ir al formulario de demostración <Icon name="arrow" size={18} />
            </button>
            <p className="figma-form-note">Explora el flujo sin enviar datos.</p>
          </div>
        )}
      </dialog>
    </ExperienceContext.Provider>
  );
}

export function PropertyFavoriteButton({
  propertyId,
  propertyName,
}: {
  propertyId: string;
  propertyName: string;
}) {
  const { favorites, toggleFavorite } = useFigmaExperience();
  const isFavorite = favorites.includes(propertyId);
  return (
    <button
      className={`figma-favorite${isFavorite ? " is-favorite" : ""}`}
      type="button"
      aria-label={`${isFavorite ? "Quitar" : "Guardar"} ${propertyName} ${isFavorite ? "de" : "en"} favoritos`}
      aria-pressed={isFavorite}
      onClick={() => toggleFavorite(propertyId)}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    </button>
  );
}
