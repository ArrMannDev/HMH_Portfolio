import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_NO_STORE_HEADERS } from "../../../../../lib/auth/http";
import { requireAdmin } from "../../../../../lib/auth/session";
import { artworkError, databaseError } from "../../../../../lib/artworks/admin";
import { ArtworkError, uuid } from "../../../../../lib/artworks/validation";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { data: image, error } = await supabase.from("project_images").select("storage_path").eq("id", uuid((await context.params).id)).maybeSingle();
    if (error) throw databaseError(error);
    if (!image) throw new ArtworkError(404, "Image not found.");
    const { data, error: storageError } = await supabase.storage.from("artworks").createSignedUrl(image.storage_path, 300);
    if (storageError) throw new ArtworkError(503, "The image is temporarily unavailable.");
    return NextResponse.redirect(data.signedUrl, { status: 307, headers: AUTH_NO_STORE_HEADERS });
  } catch (error) { return artworkError(error); }
}
