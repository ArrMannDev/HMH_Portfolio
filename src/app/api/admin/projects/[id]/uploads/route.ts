import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { authJson } from "../../../../../../lib/auth/http";
import { requireAdmin } from "../../../../../../lib/auth/session";
import { artworkError, getProject, readBody, requireSameOrigin } from "../../../../../../lib/artworks/admin";
import { ArtworkError, uploadFields, uuid } from "../../../../../../lib/artworks/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    const id = uuid((await context.params).id);
    await getProject(supabase, id);
    const { extension } = uploadFields(await readBody(request));
    const imageId = randomUUID();
    const path = `${id}/${imageId}.${extension}`;
    const { data, error } = await supabase.storage.from("artworks").createSignedUploadUrl(path, { upsert: false });
    if (error || !data) throw new ArtworkError(503, "Upload permission could not be created. Check the artworks bucket and its policies, then retry.");
    return authJson({ id: imageId, path, signedUrl: data.signedUrl });
  } catch (error) { return artworkError(error); }
}
