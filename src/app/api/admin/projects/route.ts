import type { NextRequest } from "next/server";
import { authJson } from "../../../../lib/auth/http";
import { requireAdmin } from "../../../../lib/auth/session";
import { artworkError, databaseError, projectSelect, readBody, requireSameOrigin } from "../../../../lib/artworks/admin";
import { ArtworkError, projectFields } from "../../../../lib/artworks/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("projects").select(projectSelect).order("sort_order").order("created_at").limit(1000);
    if (error) throw databaseError(error);
    return authJson({ projects: data });
  } catch (error) { return artworkError(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const fields = projectFields(await readBody(request));
    if (fields.is_published) throw new ArtworkError(400, "Create a draft and add images before publishing.");
    const { data, error } = await supabase.from("projects").insert(fields).select(projectSelect).single();
    if (error) throw databaseError(error);
    return authJson({ project: data }, 201);
  } catch (error) { return artworkError(error); }
}
