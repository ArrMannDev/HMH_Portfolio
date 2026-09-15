import { BriefcaseBusiness, CalendarDays } from "lucide-react";

const responsibilities = [
  "Created social media designs for digital platforms and campaigns.",
  "Wrote content for social media posts.",
  "Developed reel scripts and short-form video concepts.",
  "Managed and supported social media page activities.",
  "Collaborated with the content and creative team to produce engaging digital materials.",
];

export default function Experience() {
  return (
    <section
      id="experience"
      className="experience-section"
      aria-labelledby="experience-title"
    >
      <div className="experience-shell">
        <header className="experience-heading">
          <p className="experience-kicker">Work experience</p>
          <h2 id="experience-title">
            Designing for <span>social content.</span>
          </h2>
          <p>
            Professional experience across visual design, content development
            and social media support.
          </p>
        </header>

        <article className="experience-role" aria-labelledby="connect-studio-role">
          <div className="experience-role__masthead">
            <div className="experience-company">
              <span className="experience-icon" aria-hidden="true">
                <BriefcaseBusiness size={21} strokeWidth={1.6} />
              </span>
              <div>
                <p>Company</p>
                <h3>Connect Studio</h3>
              </div>
            </div>

            <p className="experience-date">
              <CalendarDays size={17} strokeWidth={1.6} aria-hidden="true" />
              <time dateTime="2026-03">Mar 2026</time>
              <span>to Present</span>
            </p>
          </div>

          <div className="experience-role__content">
            <div className="experience-position">
              <p>Role</p>
              <h3 id="connect-studio-role">Graphic Designer</h3>
              <p>Social Media Content Team</p>
            </div>

            <ol className="experience-responsibilities">
              {responsibilities.map((responsibility, index) => (
                <li key={responsibility}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p>{responsibility}</p>
                </li>
              ))}
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
