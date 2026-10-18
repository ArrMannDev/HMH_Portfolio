# HUX portfolio

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors explore Han Myo Htet's graphic design work. Approved administrators manage the artwork library privately.

## Product Purpose

Present real design projects and let administrators update them without editing source code.

## Capabilities and Constraints

Next.js App Router, Supabase database, private `artworks` Storage bucket, and Google OAuth. Every API endpoint lives under `src/app/api` in a `route.ts` file. Administrators are explicitly approved through `admin_users`, never inferred from email. The first dashboard version supports project search, categories, multiple ordered images, and draft/publish controls, as confirmed by the user.

## Brand Commitments

Preserve the public portfolio's current design, layout, content, and local assets. Extend the existing HUX identity rather than redesigning it. Do not fabricate clients, results, or personal facts.

## Evidence on Hand

Existing grouped projects are in `src/data/projects.ts`; original artwork, illustrations, portrait, and certificates remain in `src/assets/images`.

## Product Principles

- Keep related visuals together as one project.
- Make publication intentional and distinguish it from saving a draft.
- Keep private administration separate from the public portfolio.
- Preserve local source data and images during migration.
