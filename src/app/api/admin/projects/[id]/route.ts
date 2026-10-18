import type { NextRequest } from "next/server";
import { authJson } from "../../../../../lib/auth/http";
import { requireAdmin } from "../../../../../lib/auth/session";
import { artworkError, databaseError, getProject, readBody, requireSameOrigin } from "../../../../../lib/artworks/admin";
import { ArtworkError, imageFields, projectFields, uuid, version } from "../../../../../lib/artworks/validation";
import { MAX_FILE_BYTES, uploadTypes } from "../../../../../types/artwork";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { supabase } = await requireAdmin();
    return authJson({ project: await getProject(supabase, uuid((await context.params).id)) });
  } catch (error) { return artworkError(error); }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const id = uuid((await context.params).id);
    const input = await readBody(request);
    const fields = projectFields(input);
    const images = imageFields(input.images, id);
    const expectedVersion = version(input.updated_at);
    if (fields.is_published && !images.length) throw new ArtworkError(400, "Add at least one image before publishing.");
    // Storage enforces file size and MIME restrictions too. Check every path
    // exists before committing a project, including newly signed uploads.
    for (const image of images) {
      const { data, error } = await supabase.storage.from("artworks").info(image.storage_path);
      if (error || !data) throw new ArtworkError(400, "An image has not finished uploading. Upload it again before saving.");
      if (typeof data.size !== "number" || data.size <= 0 || data.size > MAX_FILE_BYTES || !Object.hasOwn(uploadTypes, data.contentType || "")) {
        throw new ArtworkError(400, "Images must be JPEG, PNG, or WebP files up to 10 MB.");
      }
    }
    const { error } = await supabase.rpc("save_artwork_project", {
      p_id: id, p_expected_updated_at: expectedVersion, p_project: fields, p_images: images,
    });
    if (error) throw databaseError(error);
    return authJson({ project: await getProject(supabase, id) });
  } catch (error) { return artworkError(error); }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const id = uuid((await context.params).id);
    const input = await readBody(request);
    if (input.confirm !== "DELETE") throw new ArtworkError(400, "Confirm project deletion first.");
    const { data, error } = await supabase.from("projects").delete().eq("id", id).eq("updated_at", version(input.updated_at)).select("id");
    if (error) throw databaseError(error);
    if (!data.length) throw new ArtworkError(409, "The project changed or was removed. Reload the library before deleting.");
    // Storage objects are deliberately retained. This avoids racing a save or
    // signed upload and preserves originals for manual recovery/cleanup.
    return authJson({ deleted: true, filesRetained: true });
  } catch (error) { return artworkError(error); }
}
