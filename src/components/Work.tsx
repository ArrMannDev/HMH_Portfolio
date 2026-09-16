import {
  Brush,
  Layers3,
  Megaphone,
  Monitor,
  PenTool,
  Shapes,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabels,
  projects,
  type ProjectCategory,
} from "../data/projects";

type GalleryFilter = "all" | ProjectCategory;

const galleryFilters: Array<{ value: GalleryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "advertising", label: "Advertising" },
  { value: "branding", label: "Branding" },
  { value: "campaign", label: "Campaign" },
  { value: "posters", label: "Posters" },
  { value: "social-media", label: "Social Media" },
  { value: "illustration", label: "Illustration" },
];

const skillItems: Array<{ label: string; detail: string; icon: typeof Brush }> =
  [
    { label: "Social Media", detail: "Campaign visuals", icon: Megaphone },
    { label: "Advertising", detail: "Commercial design", icon: Monitor },
    { label: "Poster Design", detail: "Print and digital", icon: PenTool },
    { label: "Branding", detail: "Visual identity", icon: Shapes },
  ];

const artworks = projects.map((project) => ({
    id: project.id,
    projectType: project.projectType,
    categories: project.categories,
    image: project.images[0],
    images: project.images,
  }));

type Artwork = (typeof artworks)[number];

function ArtworkCard({ artwork, onOpen }: { artwork: Artwork; onOpen: (artwork: Artwork) => void }) {
  return (
    <article className={`artwork-card artwork-card--${artwork.image.aspectRatio}`}>
      <button
        className="artwork-card__trigger"
        type="button"
        aria-label={`View ${artwork.projectType} artwork`}
        onClick={() => onOpen(artwork)}
      >
        <img
          src={artwork.image.src}
          alt={artwork.image.alt}
          width={artwork.image.width}
          height={artwork.image.height}
          loading="lazy"
        />
        <div className="artwork-card__caption">
          <div>
            <h3>{artwork.projectType}</h3>
            <p>
              {artwork.categories
                .map((category) => categoryLabels[category])
                .join(" / ")}
            </p>
          </div>
          <span aria-hidden="true">
            {String(artworks.indexOf(artwork) + 1).padStart(2, "0")}
          </span>
        </div>
      </button>
    </article>
  );
}

export default function Work() {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const visibleArtworks = useMemo(
    () =>
      activeFilter === "all"
        ? artworks
        : artworks.filter((artwork) =>
            artwork.categories.includes(activeFilter),
          ),
    [activeFilter],
  );

  useEffect(() => {
    if (!selectedArtwork) return;
    const lightbox = lightboxRef.current;
    if (!lightbox) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    lightbox.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      if (lightbox.open) lightbox.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [selectedArtwork]);

  const openArtwork = (artwork: Artwork) => {
    setSelectedImageIndex(0);
    setSelectedArtwork(artwork);
  };

  const closeArtwork = () => {
    setSelectedArtwork(null);
    setSelectedImageIndex(0);
  };

  return (
    <section id="work" className="work-section" aria-labelledby="work-title">
      <div className="work-shell">
        <div className="work-intro">
          <p className="work-kicker">Selected work</p>
          <h2 id="work-title">
            Work that speaks <span>visually.</span>
          </h2>
          <p className="work-summary">
            A selection of visual work created for brands, campaigns and ideas.
          </p>

          <div className="work-expertise" aria-labelledby="expertise-title">
            <div className="work-expertise__heading">
              <Layers3 size={18} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h3 id="expertise-title">Skills and tools</h3>
                <p>The disciplines and software behind the work.</p>
              </div>
            </div>

            <div className="work-tools" aria-label="Primary design tools">
              <div>
                <span className="adobe-mark adobe-ps" aria-hidden="true">
                  Ps
                </span>
                <span>Photoshop</span>
              </div>
              <div>
                <span className="adobe-mark adobe-ai" aria-hidden="true">
                  Ai
                </span>
                <span>Illustrator</span>
              </div>
            </div>

            <div className="work-skills" aria-label="Core design skills">
              {skillItems.map(({ label, detail, icon: Icon }) => (
                <div className="work-skill" key={label}>
                  <span>
                    <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="work-gallery-panel">
          <div
            className="work-filters"
            role="toolbar"
            aria-label="Filter artwork by category"
          >
            {galleryFilters.map((filter) => (
              <button
                key={filter.value}
                className={
                  activeFilter === filter.value ? "is-active" : undefined
                }
                type="button"
                aria-pressed={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div
            className="work-gallery"
            aria-live="polite"
            aria-label="Selected artwork gallery"
          >
            {visibleArtworks.length > 0 ? (
              visibleArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} onOpen={openArtwork} />
              ))
            ) : (
              <div className="work-gallery__empty">
                <Shapes size={25} strokeWidth={1.4} aria-hidden="true" />
                <h3>No artwork here yet</h3>
                <p>This category is ready for future work.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedArtwork && (
        <dialog
          ref={lightboxRef}
          className="artwork-lightbox"
          aria-label={`${selectedArtwork.projectType} preview`}
          onCancel={closeArtwork}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeArtwork();
          }}
        >
          <button
            className="artwork-lightbox__close"
            type="button"
            aria-label="Close artwork preview"
            onClick={closeArtwork}
            autoFocus
          >
            <X size={24} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <div
            className={`artwork-lightbox__viewer${
              selectedArtwork.images.length === 1 ? " artwork-lightbox__viewer--single" : ""
            }`}
          >
            {selectedArtwork.images.length > 1 && (
              <div className="artwork-lightbox__thumbnails" aria-label="Related artwork images">
                {selectedArtwork.images.map((image, index) => (
                  <button
                    type="button"
                    className={selectedImageIndex === index ? "is-active" : undefined}
                    aria-label={`View image ${index + 1} of ${selectedArtwork.images.length}`}
                    aria-pressed={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                    key={image.src}
                  >
                    <img
                      src={image.src}
                      alt=""
                      width={image.width}
                      height={image.height}
                    />
                  </button>
                ))}
              </div>
            )}

            <figure className="artwork-lightbox__figure" aria-live="polite">
              <img
                src={selectedArtwork.images[selectedImageIndex].src}
                alt={selectedArtwork.images[selectedImageIndex].alt}
                width={selectedArtwork.images[selectedImageIndex].width}
                height={selectedArtwork.images[selectedImageIndex].height}
              />
              <figcaption>
                <strong>{selectedArtwork.projectType}</strong>
                <span>
                  Image {selectedImageIndex + 1} of {selectedArtwork.images.length}
                </span>
              </figcaption>
            </figure>
          </div>
        </dialog>
      )}
    </section>
  );
}
