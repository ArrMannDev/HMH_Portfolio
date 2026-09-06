import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import studioVideo from '../assets/video/creative_studio_video.mp4';

const navItems = ['Work', 'Services', 'About Us', 'Process', 'Careers'];


const slugify = (label: string) => `#${label.toLowerCase().replaceAll(' ', '-')}`;

export default function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const showreelVideoRef = useRef<HTMLVideoElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const showreelButtonRef = useRef<HTMLButtonElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);

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
      if (document.visibilityState === 'visible') startBackgroundVideo();
    };

    startBackgroundVideo();
    video.addEventListener('canplay', startBackgroundVideo);
    document.addEventListener('visibilitychange', resumeWhenVisible);

    return () => {
      video.removeEventListener('canplay', startBackgroundVideo);
      document.removeEventListener('visibilitychange', resumeWhenVisible);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-locked', isMenuOpen || isShowreelOpen);

    if (isMenuOpen) menuCloseRef.current?.focus();
    if (isShowreelOpen) {
      const video = showreelVideoRef.current;
      if (video) {
        video.playbackRate = 0.7;
        void video.play().catch(() => undefined);
      }
      modalCloseRef.current?.focus();
    } else {
      showreelVideoRef.current?.pause();
    }

    return () => document.body.classList.remove('is-locked');
  }, [isMenuOpen, isShowreelOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isShowreelOpen) {
        setIsShowreelOpen(false);
        requestAnimationFrame(() => showreelButtonRef.current?.focus());
      } else if (isMenuOpen) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, isShowreelOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const closeShowreel = () => {
    setIsShowreelOpen(false);
    requestAnimationFrame(() => showreelButtonRef.current?.focus());
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
        <div className="hero-gradient hero-gradient-bottom" aria-hidden="true" />
        <div className="hero-gradient hero-gradient-mobile" aria-hidden="true" />

        <div className="hero-layout">
          <header className="site-header" aria-label="Primary navigation">
            <a href="#" className="brand" aria-label="HUX home">
              HUX<span> Design </span>
            </a>

            <nav className="desktop-nav" aria-label="Desktop navigation">
              {navItems.map((item) => (
                <a key={item} href={slugify(item)}>{item}</a>
              ))}
            </nav>

            <a className="contact-button" href="mailto:hello@hux.studio">
              Contact Us <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
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
                We help brands turn ideas into meaningful experiences through design, strategy and creativity.
              </p>
              <div className="hero-actions reveal reveal-4">
                <button
                  ref={showreelButtonRef}
                  className="primary-button"
                  type="button"
                >
                  See Our Work
                  <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      <div id="mobile-menu" className={`mobile-menu${isMenuOpen ? ' is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <button className="menu-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />
        <nav className="menu-panel" aria-label="Mobile navigation">
          <div className="menu-header">
            <span className="brand" aria-hidden="true">HUX<span>Graphic </span></span>
            <button ref={menuCloseRef} className="icon-button" type="button" aria-label="Close navigation" onClick={closeMenu}>
              <X size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <a key={item} href={slugify(item)} onClick={closeMenu}>{item}</a>
            ))}
          </div>
          <a className="mobile-contact" href="mailto:hello@hux.studio">
            Contact Us <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </nav>
      </div>

      <div
        className={`showreel-modal${isShowreelOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showreel-title"
        aria-hidden={!isShowreelOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeShowreel();
        }}
      >
        <div className="showreel-frame">
          <p id="showreel-title">HUX Showreel</p>
          <button ref={modalCloseRef} className="modal-close" type="button" aria-label="Close showreel" onClick={closeShowreel}>
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <video ref={showreelVideoRef} loop muted playsInline controls preload="metadata">
            <source src={studioVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </>
  );
}
