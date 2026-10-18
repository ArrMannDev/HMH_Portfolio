import { NextResponse, type NextRequest } from "next/server";
import { AUTH_NO_STORE_HEADERS, authRedirect, getAuthOrigin } from "../../../../../lib/auth/http";
import { requireAdmin } from "../../../../../lib/auth/session";
import { artworkError, requireSameOrigin } from "../../../../../lib/artworks/admin";
import { importOneProject, importStatus, localImport, verifyLocalImport } from "../../../../../lib/artworks/local-import";
import { ArtworkError } from "../../../../../lib/artworks/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const status = await importStatus(supabase);
    const completed = status.filter((entry) => entry.complete);
    const next = status.find((entry) => !entry.complete);
    // A small administrator-only migration utility, not a replacement dashboard.
    // GET reports status only. Every upload/write requires a same-origin POST.
    return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Local artwork import | HUX</title></head><body><main><h1>Local artwork import</h1><p>Administrator access verified.</p><p>${completed.length} of ${status.length} projects imported. ${completed.reduce((sum, entry) => sum + entry.images, 0)} of ${localImport.reduce((sum, entry) => sum + entry.images.length, 0)} image records saved.</p><p>New projects are imported as drafts. Existing projects and original files are preserved. Uploaded bytes are verified with SHA-256.</p>${next ? next.conflict ? `<p role="alert">Import conflict: ${escape(next.slug)}. Existing data has not been overwritten.</p>` : `<form method="post" action="/api/admin/import/local"><input type="hidden" name="confirm" value="IMPORT_LOCAL_ARTWORK"><input type="hidden" name="index" value="${next.index}"><button type="submit">Import next project: ${escape(next.slug)} (${next.images} images)</button></form>` : `<p>All local project records are present.</p><form method="post" action="/api/admin/import/local"><input type="hidden" name="confirm" value="VERIFY_LOCAL_ARTWORK"><button type="submit">Verify all imported images</button></form>`}<ol>${status.map((entry) => `<li>${escape(entry.slug)}: ${entry.images} images, ${entry.complete ? "Imported" : entry.conflict ? "Conflict - review needed" : "Not imported"}</li>`).join("")}</ol><p><a href="/dashboard">Return to artwork dashboard</a></p></main></body></html>`, {
      headers: { ...AUTH_NO_STORE_HEADERS, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin" },
    });
  } catch (error) { return artworkError(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const { supabase } = await requireAdmin();
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) throw new ArtworkError(415, "Use the local import form.");
    const length = Number(request.headers.get("content-length"));
    if (!Number.isFinite(length) || length <= 0 || length > 256) throw new ArtworkError(413, "Invalid import form size.");
    const body = await request.text();
    if (body.length > 256) throw new ArtworkError(413, "Invalid import form size.");
    const form = new URLSearchParams(body);
    const origin = getAuthOrigin(request);
    if (form.get("confirm") === "VERIFY_LOCAL_ARTWORK") {
      const result = await verifyLocalImport(supabase, origin);
      return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Import verified | HUX</title></head><body><main><h1>Import verified</h1><p>${result.projects} projects and ${result.images} images match the original local artwork.</p><p>All project groupings, image order, categories, descriptions and SHA-256 file checksums verified. New projects remain drafts. No original files or unrelated projects were changed.</p><p><a href="/dashboard">Open artwork dashboard</a></p></main></body></html>`, { headers: { ...AUTH_NO_STORE_HEADERS, "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
    }
    if (form.get("confirm") !== "IMPORT_LOCAL_ARTWORK" || !/^\d+$/.test(form.get("index") || "")) throw new ArtworkError(400, "Confirm the local artwork import first.");
    const index = Number(form.get("index"));
    if (!Number.isSafeInteger(index) || index < 0 || index >= localImport.length) throw new ArtworkError(400, "Invalid local project index.");
    await importOneProject(supabase, index, origin);
    return authRedirect(origin, "/api/admin/import/local");
  } catch (error) { return artworkError(error); }
}
