import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Layers3,
  MapPin,
  Menu,
  Moon,
  PenTool,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import portrait from "../assets/images/HMH.png";
import cvDocument from "../assets/images/Graphic Design CV(Mg-Hux).pdf";

type HeroProps = {
  contactUrl?: string;
  availableForWork?: boolean;
};

export default function Hero({
  contactUrl,
  availableForWork = false,
}: HeroProps) {
  const [dimmed, setDimmed] = useState(false);
  const [dialog, setDialog] = useState<"menu" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!dialog) return;
    const element = dialogRef.current;
    if (!element) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [dialog]);

  return (
    <>
      <section
        id="home"
        className={`hero${dimmed ? " hero--dimmed" : ""}`}
        aria-labelledby="hero-title"
      >
        <div className="hero-art">
          <img
            src={portrait}
            alt="Han Myo Htet against a blue and pink planetary backdrop"
            width={1536}
            height={1024}
            loading="eager"
          />
        </div>
        <div className="hero-shade" aria-hidden="true" />

        <div className="hero-frame">
          <header className="site-header">
            <a className="brand" href="#home" aria-label="Han Myo Htet home">
              <span className="brand-monogram" aria-hidden="true">
                HUX<span>.</span>
              </span>
              <span className="brand-info">
                <strong>Han Myo Htet</strong>
                <span>Graphic Designer</span>
              </span>
            </a>

            <nav className="desktop-nav" aria-label="Main navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? "nav-active" : undefined
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/work"
                className={({ isActive }) =>
                  isActive ? "nav-active" : undefined
                }
              >
                Work
              </NavLink>
              <a href="#intro">About</a>
              {contactUrl ? (
                <a href={contactUrl}>Contact</a>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Contact details coming soon"
                >
                  Contact
                </button>
              )}
            </nav>

            <div className="header-actions">
              <button
                className="icon-button glow-toggle"
                type="button"
                aria-label={
                  dimmed ? "Restore background glow" : "Dim background glow"
                }
                aria-pressed={dimmed}
                onClick={() => setDimmed(!dimmed)}
              >
                {dimmed ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Open navigation"
                aria-haspopup="dialog"
                onClick={() => setDialog("menu")}
              >
                <Menu size={20} />
              </button>
            </div>
          </header>

          <div className="hero-stage">
            <div className="hero-copy">
              <p className="hero-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                Crafting visual stories. Building brands.
              </p>
              <h1 id="hero-title">
                Design That
                <br />
                Speaks Before
                <br />
                <span className="headline-finish">
                  You Do<span className="headline-period">.</span>
                </span>
              </h1>
              <p id="intro" className="hero-introduction">
                Hi, I’m <strong>Han Myo Htet</strong>, a graphic designer in
                Bangkok. I create social, advertising and brand visuals that
                make a lasting impression.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/work">
                  View My Work
                  <span className="button-arrow">
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
                <a
                  className="button button-secondary"
                  href={cvDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View CV (opens in a new tab)"
                >
                  View CV
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="glass-panel designer-card">
              <PenTool size={35} strokeWidth={1.25} aria-hidden="true" />
              <span>
                Graphic
                <br />
                Designer
              </span>
              <span className="designer-rule" aria-hidden="true" />
            </div>

            <aside className="hero-side" aria-label="Designer details">
              <div className="glass-panel location-card">
                {availableForWork ? (
                  <>
                    <span className="availability-dot" aria-hidden="true" />
                    <div>
                      <strong>Available for freelance work</strong>
                      <span>Open to new projects</span>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin size={19} strokeWidth={1.7} aria-hidden="true" />
                    <div>
                      <strong>Based in Bangkok</strong>
                      <span>Thailand</span>
                    </div>
                  </>
                )}
              </div>

              <div className="glass-panel tools-card">
                <h2>Tools I use</h2>
                <div className="tool-list">
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
                <p>From first idea to final detail.</p>
              </div>
            </aside>

            <div
              className="hero-facts"
              aria-label="Experience and design focus"
            >
              <div className="glass-panel fact-card">
                <span className="fact-icon fact-icon--blue">
                  <BriefcaseBusiness
                    size={23}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <strong className="fact-value">1+</strong>
                  <h2>Year of experience</h2>
                  <p>
                    Creating visuals with
                    <br />
                    clarity and purpose.
                  </p>
                </div>
              </div>
              <div className="glass-panel fact-card">
                <span className="fact-icon fact-icon--violet">
                  <Layers3 size={23} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <strong className="fact-value fact-value--text">
                    Brand &amp; social
                  </strong>
                  <h2>Design with a message</h2>
                  <p>
                    Social media, advertising
                    <br />
                    and brand identities.
                  </p>
                </div>
              </div>
              <div className="glass-panel fact-card">
                <span className="fact-icon fact-icon--pink">
                  <PenTool size={23} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <strong className="fact-value fact-value--text">
                    Print &amp; digital
                  </strong>
                  <h2>Across formats</h2>
                  <p>
                    Posters, campaign graphics
                    <br />
                    and commercial visuals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {dialog && (
        <dialog
          ref={dialogRef}
          className={`hero-dialog hero-dialog--${dialog}`}
          aria-labelledby="dialog-title"
          onCancel={() => setDialog(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <div className="dialog-content">
            <div className="dialog-header">
              <h2 id="dialog-title">Explore</h2>
              <button
                className="icon-button"
                type="button"
                aria-label="Close dialog"
                onClick={() => setDialog(null)}
                autoFocus
              >
                <X size={22} />
              </button>
            </div>
            <nav className="drawer-nav" aria-label="Expanded navigation">
              <Link to="/" onClick={() => setDialog(null)}>
                Home
                <ArrowUpRight />
              </Link>
              <Link to="/work" onClick={() => setDialog(null)}>
                Work
                <ArrowUpRight />
              </Link>
              <a href="#intro" onClick={() => setDialog(null)}>
                About
                <ArrowUpRight />
              </a>
              {contactUrl && (
                <a href={contactUrl}>
                  Contact
                  <ArrowUpRight />
                </a>
              )}
            </nav>
          </div>
        </dialog>
      )}
    </>
  );
}
