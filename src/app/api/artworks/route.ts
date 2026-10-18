import { authJson } from "../../../lib/auth/http";
import { publishedProjects } from "../../../lib/artworks/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return authJson({ projects: await publishedProjects() }); }
  catch { return authJson({ error: "Artwork could not be loaded. Please retry." }, 503); }
}
