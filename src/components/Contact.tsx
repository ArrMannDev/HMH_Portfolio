import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react";

type ContactProps = {
  email: string;
};

export default function Contact({ email }: ContactProps) {
  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="contact-shell">
        <div className="contact-main">
          <header className="contact-heading">
            <h2 id="contact-title">
              Let&apos;s make something <span>worth noticing.</span>
            </h2>
            <p>
              Available for freelance projects, campaign work and creative
              collaborations.
            </p>
          </header>

          <address className="contact-details">
            <div className="contact-availability">
              <span aria-hidden="true" />
              Available for freelance work
            </div>

            <a className="contact-email" href={`mailto:${email}`}>
              <span className="contact-email__icon" aria-hidden="true">
                <Mail size={21} strokeWidth={1.6} />
              </span>
              <span>
                <small>Email</small>
                <strong>{email}</strong>
              </span>
              <ArrowUpRight size={24} strokeWidth={1.6} aria-hidden="true" />
            </a>

            <p className="contact-location">
              <MapPin size={18} strokeWidth={1.6} aria-hidden="true" />
              Bangkok, Thailand
            </p>
          </address>
        </div>

        <footer className="contact-footer">
          <div>
            <strong>Han Myo Htet</strong>
            <span>Graphic Designer</span>
          </div>
          <p>&copy; 2026 Han Myo Htet. All rights reserved.</p>
          <a href="#home">
            Back to top
            <ArrowUp size={16} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}
