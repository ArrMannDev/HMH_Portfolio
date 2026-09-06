import { ArrowUpRight, BriefcaseBusiness, MapPin, PenTool } from 'lucide-react';
import portrait from '../assets/images/HMH.png';

const specialties = [
  'Social Media Design',
  'Advertising Design',
  'Poster Design',
  'Branding',
  'Commercial Visual Design',
];

export default function About() {
  return (
    <section id="abou-me" className="about-section" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-grid">
          <dl className="about-facts" aria-label="Designer at a glance">
            <div className="about-fact about-fact--experience">
              <dt><BriefcaseBusiness size={21} strokeWidth={1.8} aria-hidden="true" />Experience</dt>
              <dd><strong>1+</strong><span>year in graphic design</span></dd>
            </div>
            <div className="about-fact">
              <dt><MapPin size={21} strokeWidth={1.8} aria-hidden="true" />Based in</dt>
              <dd>Bangkok<span>Thailand</span></dd>
            </div>
            <div className="about-fact">
              <dt><PenTool size={21} strokeWidth={1.8} aria-hidden="true" />My toolkit</dt>
              <dd>Adobe Photoshop<span>Adobe Illustrator</span></dd>
            </div>
          </dl>

          <div className="about-story">
            <header className="about-heading">
              <p className="about-label">About me</p>
              <div className="about-identity">
                <h2 id="about-title" className="about-title">Hi, I’m <span>Han Myo Htet.</span></h2>
                <p className="about-role">Graphic Designer</p>
              </div>
            </header>

            <p className="about-intro">
              I’m a graphic designer with over a year of experience, creating focused visual work for brands, businesses and campaigns.
            </p>
            <p className="about-copy">
              From social media and advertising to posters and branding, I create visuals that bring a clear message to life.
            </p>
            <p className="about-statement">
              For me, strong design should catch the eye, carry the message and stay in mind.
            </p>

            <a className="primary-button about-work-link" href="#work">
              View my work
              <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </a>

            <div className="about-specialties-wrap">
              <h3>What I design</h3>
              <ul className="about-specialties" aria-label="Design specialties">
                {specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}
              </ul>
            </div>
          </div>

          <figure className="about-portrait-wrap">
            <img
              className="about-portrait"
              src={portrait}
              alt="Portrait of Han Myo Htet"
              width={1280}
              height={1280}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
