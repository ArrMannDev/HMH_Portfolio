import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, FileText, Menu, X } from "lucide-react";
import studioVideo from "../assets/video/creative_studio_video.mp4";

const navItems = ["About Me", "Work", "Services", "Experience", "Education"];

const slugify = (label: string) =>
  label === "About Me" ? "#abou-me" : `#${label.toLowerCase().replaceAll(" ", "-")}`;

type HeroProps = {
  /** URL of the real resume PDF, supplied when available. */
  resumeUrl?: string;
};

export default function Hero({ resumeUrl }: HeroProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const video = ambientVideoRef.current;
    if (!video) return;

    const startBackgroundVideo = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playbackRate = 0.7;
      void video.play().catch(() => undefined);
    };

    const resumeWhenVisible = () => {
      if (document.visibilityState === "visible") startBackgroundVideo();
    };

    startBackgroundVideo();
    video.addEventListener("canplay", startBackgroundVideo);
    document.addEventListener("visibilitychange", resumeWhenVisible);

    return () => {
      video.removeEventListener("canplay", startBackgroundVideo);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", isMenuOpen);

    if (isMenuOpen) menuCloseRef.current?.focus();

    return () => document.body.classList.remove("is-locked");
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isMenuOpen) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  return (
    <>
      <main className="hero-shell">
        <video
          ref={ambientVideoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={studioVideo} type="video/mp4" />
        </video>

        <div className="hero-gradient hero-gradient-left" aria-hidden="true" />
        <div className="hero-gradient hero-gradient-top" aria-hidden="true" />
        <div
          className="hero-gradient hero-gradient-bottom"
          aria-hidden="true"
        />
        <div
          className="hero-gradient hero-gradient-mobile"
          aria-hidden="true"
        />

        <div className="hero-layout">
          <header className="site-header" aria-label="Primary navigation">
            <a href="#" className="brand" aria-label="HUX home">
              HUX<span> Design </span>
            </a>

            <nav className="desktop-nav" aria-label="Desktop navigation">
              {navItems.map((item) => (
                <a key={item} href={slugify(item)}>
                  {item}
                </a>
              ))}
            </nav>

            <a className="contact-button" href="mailto:hello@hux.studio">
              Contact Us{" "}
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </a>

            <button
              ref={menuButtonRef}
              className="icon-button menu-button"
              type="button"
              aria-label="Open navigation"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </header>

          <section className="hero-content-wrap" aria-labelledby="hero-title">
            <div className="hero-content">
              <p className="eyebrow reveal reveal-1">
                We design <span>/</span> We brand <span>/</span> We grow
              </p>
              <h1 id="hero-title" className="hero-title reveal reveal-2">
                <span>Ideas That</span>
                <em>Inspire.</em>
              </h1>
              <p className="hero-copy reveal reveal-3">
                We help brands turn ideas into meaningful experiences through
                design, strategy and creativity.
              </p>
              <div className="hero-actions reveal reveal-4">
                <a className="primary-button" href="#work">
                  See My Arts
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </a>
                {resumeUrl ? (
                  <a
                    className="resume-button"
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Resume (opens in a new tab)"
                  >
                    Resume
                    <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                ) : (
                  <button
                    className="resume-button"
                    type="button"
                    disabled
                    title="Resume not yet available"
                    aria-label="Resume (not yet available)"
                  >
                    Resume
                    <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div
        id="mobile-menu"
        className={`mobile-menu${isMenuOpen ? " is-open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <button
          className="menu-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
        <nav className="menu-panel" aria-label="Mobile navigation">
          <div className="menu-header">
            <span className="brand" aria-hidden="true">
              HUX<span>Graphic </span>
            </span>
            <button
              ref={menuCloseRef}
              className="icon-button"
              type="button"
              aria-label="Close navigation"
              onClick={closeMenu}
            >
              <X size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <a key={item} href={slugify(item)} onClick={closeMenu}>
                {item}
              </a>
            ))}
          </div>
          <a className="mobile-contact" href="mailto:hello@hux.studio">
            Contact Us{" "}
            <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </>
  );
}
