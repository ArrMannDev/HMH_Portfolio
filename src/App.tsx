import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Contact from "./components/Contact";

const contactEmail = "hanmyohtet85@gmail.com";

export default function App() {
  return (
    <main>
      <Hero availableForWork />
      <Work />
      <Experience />
      <Education />
      <Contact email={contactEmail} />
    </main>
  );
}
