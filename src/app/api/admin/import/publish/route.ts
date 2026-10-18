import { NextResponse, type NextRequest } from "next/server";
import { AUTH_NO_STORE_HEADERS, getAuthOrigin } from "../../../../../lib/auth/http";
import { requireAdmin } from "../../../../../lib/auth/session";
import { artworkError, databaseError, requireSameOrigin } from "../../../../../lib/artworks/admin";
import { importStatus, localImport } from "../../../../../lib/artworks/local-import";
import { publishLocalImport } from "../../../../../lib/artworks/publish-import";
import { ArtworkError } from "../../../../../lib/artworks/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function html(content: string) {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Publish artwork | HUX</title></head><body><main>${content}</main></body></html>`, {
    headers: {
      ...AUTH_NO_STORE_HEADERS, "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin",
    },
  });
}

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const status = await importStatus(supabase);
    const ready = status.every((entry) => entry.complete && !entry.conflict);
    const { data, error } = await supabase.from("projects").select("id,is_published").in("id", localImport.map((entry) => entry.id));
    if (error) throw databaseError(error);
    const published = data.filter((entry) => entry.is_published).length;
    return html(`<h1>Publish imported artwork</h1><p>${status.length} imported projects with ${localImport.reduce((sum, entry) => sum + entry.images.length, 0)} related images. ${published} already published.</p><p>Only the imported collection will be published. Original files, static data, and unrelated drafts will not be changed.</p>${ready ? published === status.length ? "<p>All imported artwork projects are published.</p>" : `<form method="post" action="/api/admin/import/publish"><input type="hidden" name="confirm" value="PUBLISH_IMPORTED_ARTWORK"><button type="submit">Publish all ${status.length} imported projects</button></form>` : "<p>Resolve missing or conflicting imported records before publishing.</p>"}<p><a href="/dashboard">Artwork dashboard</a></p><p><a href="/#work">View artwork section</a></p>`);
  } catch (error) { return artworkError(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) throw new ArtworkError(415, "Use the artwork publication form.");
    const size = Number(request.headers.get("content-length"));
    if (!Number.isFinite(size) || size <= 0 || size > 128) throw new ArtworkError(413, "Invalid publication form.");
    const body = await request.text();
    if (body.length > 128 || new URLSearchParams(body).get("confirm") !== "PUBLISH_IMPORTED_ARTWORK") throw new ArtworkError(400, "Confirm publication first.");
    const result = await publishLocalImport(supabase, getAuthOrigin(request));
    return html(`<h1>Artwork published</h1><p>${result.projects} artwork projects with ${result.images} related images are published.</p><p>Original static data, local files, and unrelated drafts are unchanged.</p><p><a href="/#work">View artwork section</a></p><p><a href="/dashboard">Open dashboard</a></p>`);
  } catch (error) { return artworkError(error); }
}
