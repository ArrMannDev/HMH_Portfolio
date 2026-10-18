import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Contact from "./components/Contact";
import type { Project } from "./types/artwork";

const contactEmail = "hanmyohtet85@gmail.com";

export default function App({ projects }: { projects: Project[] }) {
  return (
    <main>
      <Hero availableForWork />
      <Work projects={projects} />
      <Experience />
      <Education />
      <Contact email={contactEmail} />
    </main>
  );
}
