import { NextResponse, type NextRequest } from "next/server";
import { AUTH_NO_STORE_HEADERS, authJson } from "../../../../../lib/auth/http";
import { publicClient } from "../../../../../lib/artworks/public";
import { uuid } from "../../../../../lib/artworks/validation";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const id = uuid((await context.params).id);
    const supabase = publicClient();
    const { data: image, error } = await supabase.from("project_images")
      .select("storage_path,projects!inner(is_published)").eq("id", id).eq("projects.is_published", true).maybeSingle();
    if (error) return authJson({ error: "Image unavailable." }, 503);
    if (!image) return authJson({ error: "Image not found." }, 404);
    const { data, error: storageError } = await supabase.storage.from("artworks").createSignedUrl(image.storage_path, 300);
    if (storageError) return authJson({ error: "Image unavailable." }, 503);
    return NextResponse.redirect(data.signedUrl, { status: 307, headers: AUTH_NO_STORE_HEADERS });
  } catch { return authJson({ error: "Image not found." }, 404); }
}
