import App from "../App";
import { projects as localProjects } from "../data/projects";
import { publishedProjects } from "../lib/artworks/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // The live gallery uses published database projects. Keep the original local
  // collection available as an explicit rollback, never an automatic fallback.
  const projects = process.env.ARTWORK_SOURCE === "local"
    ? localProjects
    : await publishedProjects().catch(() => []);
  return <App projects={projects} />;
}
