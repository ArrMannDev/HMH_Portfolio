import {
  Brush,
  Layers3,
  Megaphone,
  Monitor,
  PenTool,
  Shapes,
} from "lucide-react";
import {
  categoryLabels,
  projects,
  type ProjectCategory,
} from "../data/projects";

const skillItems: Array<{ label: string; detail: string; icon: typeof Brush }> =
  [
    { label: "Social Media", detail: "Campaign visuals", icon: Megaphone },
    { label: "Advertising", detail: "Commercial design", icon: Monitor },
    { label: "Poster Design", detail: "Print and digital", icon: PenTool },
    { label: "Branding", detail: "Visual identity", icon: Shapes },
  ];

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article
      className={`work-project${project.images.length > 1 ? " work-project--campaign" : ""}`}
    >
      <div className="work-project__media">
        {project.images.map((image) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
          />
        ))}
      </div>
      <div className="work-project__body">
        <p>
          {project.categories
            .map((category: ProjectCategory) => categoryLabels[category])
            .join(" / ")}
        </p>
        <h3>{project.title ?? project.projectType}</h3>
      </div>
    </article>
  );
}

export default function Work() {
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

        <div className="work-gallery" aria-label="Selected design projects">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
