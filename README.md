# Han Myo Htet Portfolio

A Next.js App Router portfolio built with React, TypeScript, and plain CSS.

## Development

Use Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The homepage contains Hero, Work, Experience,
Education, and Contact. The previous `/work` URL redirects to `/#work`.

## Verification and production

```sh
npm run typecheck
npm run build
npm start
```

## Source layout

- `src/app`: Next.js pages, root layout, and metadata.
- `src/App.tsx`: Portfolio section composition.
- `src/components`: Existing portfolio components and interactive previews.
- `src/index.css`: Existing theme and responsive styles.
- `src/data/projects.ts`: Local artwork data, retained for future migration.
- `src/assets/images`: Original artwork, illustrations, portrait, certificates,
  and CV. These source assets are preserved.
- `public/documents`: Browser-accessible copy of the CV.
- `src/lib/image.ts`: Normalizes local image imports and URL strings.

The public layout is preserved. Artwork can come from local source files or
published Supabase projects, controlled by `ARTWORK_SOURCE`.

## Google authentication

Authentication uses `@supabase/ssr`, server-side PKCE, and HTTP-only cookies.
All endpoints are Next.js Route Handlers under `src/app/api`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/google` | Start Google sign-in |
| GET | `/api/auth/callback` | Exchange the OAuth code for a session |
| POST | `/api/auth/logout` | Sign out on the current device |
| GET | `/api/auth/session` | Read the verified account and admin status |
| GET | `/api/admin/session` | Require verified administrator membership |

Open `/dashboard/login` to sign in. `/account` shows the signed-in account,
administrator status, and the UUID needed for initial administrator setup.
The public portfolio has no sign-in controls or layout changes.
Approved administrators continue to `/dashboard` after OAuth. Pending accounts
continue to `/account` through the dashboard's access check.

### Environment

Copy `.env.example` to `.env.local` and fill in the Supabase Project URL,
publishable API key, and stable production site origin. Alternatively, the
existing `Project_URL` and `Publishable_API_Key` environment names are supported
server-side. Add the same configuration in Vercel. No secret/service-role key
or Google Client Secret is needed by the application.

### Supabase redirect allowlist

In Authentication > URL Configuration, use the production site as Site URL
and add these Redirect URLs:

```text
http://localhost:3000/api/auth/callback
http://127.0.0.1:3000/api/auth/callback
https://hmh-portfolio-nine.vercel.app/api/auth/callback
```

Use the exact local origin and port you open in the browser. These replace
the previously planned `/auth/callback` URLs. Google's authorized redirect URI
stays the Supabase URL `https://<project-ref>.supabase.co/auth/v1/callback`.
Deploy and test Google sign-in after updating the Supabase allowlist.

### Initial administrator

1. Sign in through Google. The account page initially shows pending approval.
2. Copy its User ID, or find the same user in Supabase Authentication > Users.
3. Using the Supabase SQL Editor, run the following with the real UUID:

```sql
insert into public.admin_users (user_id)
values ('REPLACE_WITH_YOUR_USER_UUID'::uuid)
on conflict (user_id) do nothing;
```

4. Select Check access again. The account should now show Administrator.

There is intentionally no administrator-enrollment API or automatic promotion
by email. Signed-out session requests return 401, authenticated non-admins get
403 from admin endpoints, and verification/database failures deny access.
Session responses and private pages are not publicly cached. Mutating auth
endpoints accept only same-origin POSTs. Every future protected API endpoint
must invoke `requireAdmin()` itself; the refresh proxy is not authorization.

### Verification

With a configured local server running, execute `npm run test:auth`.
To test another local port, use `npm run test:auth -- http://127.0.0.1:3100`.
The checks cover signed-out access, CSRF rejection, method restrictions, callback
redirects, PKCE, and cookie attributes. They do not complete Google login or
grant administrator access; verify the signed-in flow with your own account.

## Artwork dashboard

Open http://localhost:3000/dashboard after signing in as an approved admin.
The dashboard has a searchable, category/status-filtered project library and a
project editor. Related images stay in one project; the first ordered image is
the gallery cover. Controls support draft creation, publishing, unpublishing,
image descriptions, image ordering, display order, and confirmed project deletion.

### 1. Install the project-save function

This uses the original `projects`, `project_images`, `admin_users` tables and
their existing RLS policies. In Supabase:

1. Open your project, select **SQL Editor**, then **New query**.
2. Open `supabase/migrations/202610180001_artwork_editor.sql` locally.
3. Copy the complete file into the SQL query and select **Run**.
4. Expect **Success. No rows returned.** Existing data is preserved.

The security-invoker function checks administrator membership, locks the parent
project, rejects stale versions, and saves project details plus all ordered image
records in one transaction. A failed image update cannot leave half a published
project behind. Without this function, draft creation works but saving an edited
project returns a setup message with the migration path.

### 2. Check the private Storage bucket

Keep the `artworks` bucket private, with a 10 MB per-file limit and allowed types
`image/jpeg`, `image/png`, `image/webp`. Keep the existing admin-management and
published-image-read Storage policies. Uploads use random immutable paths under
`<project_uuid>/<image_uuid>.<extension>`.

The authenticated API issues a signed upload URL. The browser uploads directly
to Supabase, rather than passing large files through Vercel. Saving verifies the
objects exist and checks size and MIME metadata. No service-role key, S3 secret,
or browser-persisted auth token is required.

### 3. Published projects and the public gallery

1. Published Supabase projects are now the default public gallery source.
2. Create a draft, then upload up to 24 related images. Add a meaningful image
   description to each one. Save the draft or publish it.
3. Use `ARTWORK_SOURCE=supabase` or omit the variable to use database artwork.
   An existing `ARTWORK_SOURCE=local` override must be changed in both local
   environment settings and Vercel. Restart/redeploy after an environment change.
4. The existing gallery layout, category filters, and image lightbox use only
   published Supabase projects. Drafts never appear publicly. The original static
   collection remains available as an explicit rollback with `ARTWORK_SOURCE=local`.

The public gallery shows nine projects initially and reveals nine more near the
bottom as visitors scroll. Category changes restart at nine. A Load more work
button remains available for keyboard users or browsers without IntersectionObserver.
This progressively renders the fetched collection; it does not change database queries.

Switching sources does not import, modify, or delete local artwork. The original
21 grouped local projects and their images remain available in the repository.
In Supabase mode an empty/unavailable database does **not** restore local artwork
automatically. This avoids resurfacing work after you unpublish the last project.

### Import the existing local collection

An approved administrator can open `/api/admin/import/local` while signed in.
This migration utility imports the 21 source projects and 34 related images as
drafts. It preserves grouping, categories, descriptions, display order, and the
first-image cover. Duplicate source slugs receive a `-2` suffix; their projects
remain separate. Existing unrelated projects are not changed.

The status page is read-only. Each **Import next project** form submits one
same-origin authenticated POST. Stable project/image IDs make retries resumable.
Uploads never overwrite existing objects; an existing object must match the
source file's SHA-256 checksum. Edited or conflicting database records stop the
import rather than being overwritten. After importing, **Verify all imported
images** checks every saved record and downloads all 34 originals for checksum
verification. GET never uploads, publishes, or changes data.

The import itself does not publish projects or change `ARTWORK_SOURCE`. Review
drafts and publish them deliberately to make them visible in the public gallery.
The utility expects the current local JPEG collection and the existing project-
save SQL function. No secret/service-role key is required.

For the initial collection, `/api/admin/import/publish` provides a protected
publication form. Its GET is read-only. Its same-origin POST rechecks all original
checksums and saved metadata, then publishes only the 21 deterministic import IDs.
It uses version checks, changes only publication flags, and leaves unrelated
drafts and image records intact. A partial interruption can be retried safely.

`node scripts/verify-live-gallery.mjs` performs anonymous read-only checks for
the 21 published projects, all 34 image routes, grouped images, and database-backed
homepage covers. It does not use an admin session or publish any records.

### API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/admin/projects` | List projects or create a draft |
| GET, PUT, DELETE | `/api/admin/projects/[id]` | Read, atomically save, or delete a project |
| POST | `/api/admin/projects/[id]/uploads` | Issue a signed upload URL |
| GET | `/api/admin/images/[id]` | Authorize a private admin image preview |
| GET | `/api/artworks` | Read published projects without admin cookies |
| GET | `/api/artworks/images/[id]` | Check publication and redirect to a temporary image URL |

Every admin API revalidates identity and membership. Mutations additionally
require a same-origin JSON request. Private responses and image redirects use
`no-store`. Public queries use an anonymous client with no administrator cookies.
Stable application image URLs create fresh signed links on demand; Storage paths
and temporary signed URLs are not stored in the public project data. Existing
signed links may remain usable for up to five minutes after unpublishing.

### Recovery and limits

- Reordering and removing images only takes effect when saving. Dashboard links
  use document navigation so the browser's leave-page warning protects unsaved
  edits during link navigation, Back/Forward, reloading, signing out, or closing.
  Enter saves without changing publication status; unpublishing is explicit.
- A version conflict rejects the save instead of overwriting another session.
- Deleting a project requires typing `DELETE` and removes database records.
  Uploaded Storage files are deliberately retained for manual recovery/cleanup.
  There is no project-restore UI; use Supabase backups if needed.
- Uploads abandoned before saving also remain in Storage. Review unreferenced
  objects manually; the app does not silently delete original files.
- The library reads up to 1,000 projects, with client-side search and 12 projects
  per page. Add server-side paging before exceeding this limit.

### Dashboard verification

```sh
npm run typecheck
npm run build
npm run test:artworks
npm run test:auth
npm run test:editor
npm run test:gallery
node scripts/verify-dashboard-fixture.mjs
```

The first two API test commands expect a running local server. To use a different
port: `node scripts/verify-artwork-api.mjs http://127.0.0.1:3100`.
The fixture command starts an isolated production preview on port 3105 and a
fake Supabase service on port 5105, without touching real Supabase data. Add
`--serve` to keep it open for visual checks. It tests API contracts, not PostgreSQL
or real RLS. After applying the migration, test create/upload/reorder/publish/
unpublish with your own account and confirm a visitor cannot read a draft.
