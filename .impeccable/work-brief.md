# Public artwork gallery

Mode: Experience. Extend the existing HUX gallery, not its visual identity.

Visitors browse real graphic design projects. Preserve the cards, category
filters, source data, and related-image dialog. Other portfolio sections and
private dashboard behavior are outside this change.

The user chose scroll loading instead of pagination, with nine projects per
batch. Render nine initially, append nine near the bottom, and restart on a
category change. Keep a labelled manual fallback with keyboard focus moving to
the first newly revealed project. Show the actual visible/total count and an end
state. No new artwork, claims, dependencies, or database writes.

The interaction should recede behind the existing navy, pale text, pink accent,
and Plus Jakarta Sans. Keep layouts responsive and show the complete related
image group in the existing popup. The current implementation progressively
renders already-fetched project metadata, rather than changing database paging.

Verification: component regression checks cover 9/18/21, observer cleanup,
filter resets, manual fallback/focus, and empty/small collections. Browser checks
at 1280x720 and 390x844 confirm incremental loading, grouped image switching,
and no horizontal document overflow. Captures are under .impeccable/review/.

Review complete: SHIP, with no material fixes for this nine-project scroll-loading
extension. Appends stop at the filtered total; stale observers disconnect, and
automatic loading pauses while the related-image dialog is open. Verified browser
sequences are 9 → 18 → 21, six Illustration projects after filtering, and Apple
image 1 → 3 in the grouped dialog. Component checks, build, and typecheck pass.
This is a local gallery extension; no durable design-system update is required.
