import "server-only";

import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authJson, getAuthOrigin, isSameOriginRequest } from "../auth/http";
import { AuthAccessError } from "../auth/session";
import type { Database } from "../../types/database";
import type { AdminProject } from "../../types/artwork";
import { ArtworkError, record } from "./validation";

export const projectSelect =
  "id,slug,title,project_type,categories,sort_order,is_published,updated_at,project_images(id,storage_path,alt_text,width,height,sort_order)";

export function requireSameOrigin(request: NextRequest) {
  if (!isSameOriginRequest(request, getAuthOrigin(request)))
    throw new ArtworkError(403, "This request must come from the dashboard.");
}

export async function readBody(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ArtworkError(415, "Send application/json.");
  const reader = request.body?.getReader();
  if (!reader) throw new ArtworkError(400, "A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.length;
    if (size > 64000) {
      await reader.cancel();
      throw new ArtworkError(
        413,
        "Project data is too large. Upload images separately.",
      );
    }
    chunks.push(result.value);
  }
  try {
    return record(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch (error) {
    if (error instanceof ArtworkError) throw error;
    throw new ArtworkError(400, "The JSON request could not be read.");
  }
}

export function databaseError(error: { code?: string }) {
  if (error.code === "23505")
    return new ArtworkError(
      409,
      "That slug or image is already used. Choose a different slug and save again.",
    );
  if (error.code === "40001")
    return new ArtworkError(
      409,
      "This project changed in another session. Reload it before saving.",
    );
  if (error.code === "P0002")
    return new ArtworkError(404, "Project not found.");
  if (["PGRST202", "42883"].includes(error.code || ""))
    return new ArtworkError(
      503,
      "Database setup is needed. Run supabase/migrations/202610180001_artwork_editor.sql in the Supabase SQL Editor, then retry.",
    );
  if (["23514", "22023", "22P02"].includes(error.code || ""))
    return new ArtworkError(
      400,
      "Check the project fields, image descriptions, and uploaded files before saving.",
    );
  if (error.code === "42501")
    return new ArtworkError(403, "Administrator access is required.");
  return new ArtworkError(
    503,
    "The artwork database is unavailable. Your changes have not been confirmed. Please retry.",
  );
}

export function artworkError(error: unknown) {
  if (error instanceof ArtworkError || error instanceof AuthAccessError)
    return authJson({ error: error.message }, error.status);
  return authJson(
    { error: "The request could not be completed. Please retry." },
    503,
  );
}

export async function getProject(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<AdminProject> {
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) throw databaseError(error);
  if (!data) throw new ArtworkError(404, "Project not found.");
  const project = data as AdminProject;
  project.project_images.sort((a, b) => a.sort_order - b.sort_order);
  return project;
}
