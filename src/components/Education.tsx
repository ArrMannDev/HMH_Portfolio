import { useRef, useState, type MouseEvent } from "react";
import { CalendarDays, GraduationCap, X } from "lucide-react";
import donatoCertificate from "../assets/images/Donato-certificate.jpg";
import level3Diploma from "../assets/images/Level-3-diploma.jpg";
import level3Result from "../assets/images/Level3-Result.jpg";
import level5Diploma from "../assets/images/Level5-diploma.jpg";
import level5Result1 from "../assets/images/Level5-Result-1.jpg";
import level5Result2 from "../assets/images/Level5-Result-2.jpg";
import Folder from "./Folder";

const education = [
  {
    title: "Mastering Adobe Photoshop",
    institution: "Donato",
    period: "8 July 2026 - 8 September 2026",
    images: [donatoCertificate],
  },
  {
    title: "UK Degree Higher National Diploma in Computing",
    institution: "Youth International College (YIC)",
    period: "2023 - 2025",
    images: [level5Diploma, level5Result1, level5Result2],
  },
  {
    title: "BTEC International Level-3 Diploma in IT",
    institution: "Youth International College (YIC)",
    period: "2022 - 2023",
    images: [level3Diploma, level3Result],
  },
] as const;

export default function Education() {
  const certificateDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  const openCertificate = (src: string, title: string, index: number) => {
    setSelectedCertificate({
      src,
      title,
      alt: `${title} certificate ${index + 1}`,
    });
    certificateDialogRef.current?.showModal();
  };

  const closeCertificate = () => certificateDialogRef.current?.close();

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeCertificate();
  };

  return (
    <section
      id="education"
      className="education-section"
      aria-labelledby="education-title"
    >
      <div className="education-shell">
        <header className="education-heading">
          <p className="education-kicker">Education</p>
          <h2 id="education-title">
            A technical <span>foundation.</span>
          </h2>
          <p>
            Formal study in computing and information technology at Youth
            International College and graphic design at Donato.
          </p>
        </header>

        <ol className="education-timeline">
          {education.map((item) => (
            <li className="education-item" key={item.title}>
              <span className="education-marker" aria-hidden="true" />

              <article className="education-card">
                <div className="education-card__topline">
                  <span className="education-card__icon" aria-hidden="true">
                    <GraduationCap size={21} strokeWidth={1.6} />
                  </span>
                  <p className="education-card__period">
                    <CalendarDays size={16} strokeWidth={1.6} aria-hidden="true" />
                    {item.period}
                  </p>
                </div>

                <h3>{item.title}</h3>
                <p className="education-card__institution">{item.institution}</p>

                <div className="education-card__documents">
                  <div>
                    <p>Certificates</p>
                    <span>
                      {item.images.length} {item.images.length === 1 ? "document" : "documents"}
                    </span>
                  </div>
                  <Folder
                    color="#d867c9"
                    size={0.82}
                    label={`Open certificates for ${item.title}`}
                    onItemClick={(index) =>
                      openCertificate(item.images[index], item.title, index)
                    }
                    items={item.images.map((image, index) => (
                      <img
                        key={image}
                        src={image}
                        alt={`${item.title} certificate ${index + 1}`}
                        loading="lazy"
                      />
                    ))}
                  />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <dialog
        ref={certificateDialogRef}
        className="certificate-lightbox"
        aria-label="Certificate preview"
        onClick={closeFromBackdrop}
        onClose={() => setSelectedCertificate(null)}
      >
        <button
          type="button"
          className="certificate-lightbox__close"
          onClick={closeCertificate}
          aria-label="Close certificate preview"
        >
          <X size={22} strokeWidth={1.7} aria-hidden="true" />
        </button>

        {selectedCertificate && (
          <figure className="certificate-lightbox__figure">
            <img src={selectedCertificate.src} alt={selectedCertificate.alt} />
            <figcaption>{selectedCertificate.title}</figcaption>
          </figure>
        )}
      </dialog>
    </section>
  );
}
