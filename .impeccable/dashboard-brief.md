# Artwork dashboard

Mode: Operate. Scope: private `/dashboard` library and project editor, plus gallery data wiring. Confirmed by the user: searchable projects, multiple ordered images, category filters, draft/publish controls. Public portfolio design and original files must remain unchanged.

Direction: extend the incumbent HUX system, not a new identity. The administrator works with artwork and metadata together. A quiet navy interface inherits Plus Jakarta Sans and existing HUX accent tokens. Accent is reserved for primary actions and status. No decorative glass, gradients, metrics, or invented client content.

First viewport: compact HUX navigation; left-aligned library title and a single New project action; search/category/visibility toolbar; three-column desktop image-led library. Editor: artwork area on the left, narrow project-detail rail on the right, persistent save actions. On mobile the fields precede uploads, with one-column image rows and reachable save controls. Image reordering uses labelled native buttons and makes the first item the cover.

State requirements: empty, loading, error/retry, draft, published, uploading, unsaved, stale version, expired session, and explicit delete confirmation. Every admin route checks membership; all mutations check origin. The API does not bypass database RLS.

Cutover complete: the public Work section uses published Supabase projects by default. `ARTWORK_SOURCE=local` explicitly restores the preserved static collection; `supabase` or an omitted variable uses the database without fallback. Original source assets remain untouched. No automatic import or new public layout.

Verification: production build, type check, pure validator tests, denied-request tests, isolated fake-service CRUD contract tests, and desktop/tablet/mobile screenshots. The real PostgreSQL function and policies require user-run SQL and an authenticated Supabase smoke test. No production test data is created by the agent.
