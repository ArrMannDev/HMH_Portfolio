import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Hero from "./components/Hero";
import Work from "./components/Work";

function PortfolioPage() {
  const location = useLocation();

  useEffect(() => {
    const sectionId =
      location.pathname === "/work" ? "work" : location.hash.slice(1);
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <main>
      <Hero contactUrl="mailto:hello@example.com" availableForWork />
      <Work />
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/work" element={<PortfolioPage />} />
    </Routes>
  );
}
