import portrait from '../assets/images/HMH.jpg';

const specialties = [
  'Social Media Design',
  'Advertising Design',
  'Poster Design',
  'Branding',
  'Commercial Visual Design',
];

export default function About() {
  return (
    <section id="about-us" className="about-section" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-grid">
          <div className="about-story">
            <header className="about-heading">
              <p className="about-label">About me</p>
              <div className="about-identity">
                <h2 id="about-title" className="about-title">Han Myo Htet</h2>
                <p className="about-role">Graphic Designer</p>
              </div>
            </header>

            <p className="about-intro">
              I am a graphic designer based in Bangkok, creating focused visual work for brands, businesses and campaigns.
            </p>
            <p className="about-copy">
              I create promotional visuals, campaign graphics, posters, branding materials and commercial design using Adobe Photoshop and Adobe Illustrator.
            </p>
            <p className="about-statement">
              For me, strong design should catch the eye, carry the message and stay in mind.
            </p>

            <dl className="about-details">
              <div>
                <dt>Based in</dt>
                <dd>Bangkok, Thailand</dd>
              </div>
              <div>
                <dt>Specialties</dt>
                <dd>
                  <ul className="about-specialties" aria-label="Design specialties">
                    {specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Tools</dt>
                <dd>Adobe Photoshop, Adobe Illustrator</dd>
              </div>
            </dl>
          </div>

          <figure className="about-portrait-wrap">
            <img
              className="about-portrait"
              src={portrait}
              alt="Portrait of Han Myo Htet"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
