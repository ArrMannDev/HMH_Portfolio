import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";
import type { AdminProject } from "../../types/artwork";
import { databaseError, projectSelect } from "./admin";
import { localImport, verifyLocalImport } from "./local-import";
import { ArtworkError } from "./validation";

export async function publishLocalImport(supabase: SupabaseClient<Database>, origin: string) {
  // Recheck the original files and records before publication. Only import IDs
  // are eligible; unrelated projects and empty test drafts are never modified.
  await verifyLocalImport(supabase, origin);
  const ids = localImport.map((entry) => entry.id);
  const { data, error } = await supabase.from("projects").select(projectSelect).in("id", ids);
  if (error) throw databaseError(error);
  const current = data as AdminProject[];
  if (current.length !== ids.length) throw new ArtworkError(409, "Some imported projects are missing. No further projects were published.");
  for (const entry of localImport) {
    const project = current.find((item) => item.id === entry.id)!;
    const metadataMatches = Object.entries(entry.fields).every(([key, value]) => JSON.stringify(project[key as keyof typeof entry.fields]) === JSON.stringify(value));
    const images = [...project.project_images].sort((a, b) => a.sort_order - b.sort_order);
    const imagesMatch = images.length === entry.images.length && images.every((image, index) =>
      Object.entries(entry.images[index]).every(([key, value]) => key === "source" || image[key as keyof typeof image] === value));
    if (!metadataMatches || !imagesMatch) throw new ArtworkError(409, "An imported project changed. Review it before publishing the collection.");
  }
  for (const project of current) {
    if (project.is_published) continue;
    const { data: updated, error: updateError } = await supabase.from("projects")
      .update({ is_published: true }).eq("id", project.id).eq("updated_at", project.updated_at).select("id");
    if (updateError) throw databaseError(updateError);
    if (updated.length !== 1) throw new ArtworkError(409, "A project changed during publication. Completed publications are retained; review and retry remaining drafts.");
  }
  const { data: published, error: checkError } = await supabase.from("projects").select("id,is_published").in("id", ids);
  if (checkError) throw databaseError(checkError);
  if (published.length !== ids.length || published.some((entry) => !entry.is_published)) throw new ArtworkError(409, "Publication could not be confirmed for the whole collection. Check remaining drafts.");
  return { projects: published.length, images: localImport.reduce((sum, entry) => sum + entry.images.length, 0) };
}
