---
name: HUX portfolio and Studio manager
description: The inherited HUX identity with a quiet, artwork-led private administration surface.
colors:
  background: "#030d1d"
  text: "#f7f8ff"
  muted: "#c4c8d9"
  blue: "#4773ff"
  violet: "#853bea"
  pink: "#e567d7"
  glass-fill: "rgb(171 185 224 / 11%)"
  glass-border: "rgb(224 232 255 / 24%)"
  studio-surface: "#0c182b"
  studio-border: "#2c3950"
  studio-muted: "#b4bfd2"
  studio-field: "#081426"
  studio-primary: "#3c5bdf"
  studio-primary-hover: "#4a68ea"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(3.2rem, 5.45vw, 5.7rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  metadata:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
rounded:
  control: "8px"
  artwork: "12px"
  panel: "16px"
spacing:
  compact: "0.5rem"
  control-gap: "0.75rem"
  regular: "1rem"
  group: "1.5rem"
  section: "2rem"
  major: "3rem"
components:
  studio-button-primary:
    backgroundColor: "{colors.studio-primary}"
    textColor: "white"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
  studio-button-primary-hover:
    backgroundColor: "{colors.studio-primary-hover}"
  studio-button-secondary:
    backgroundColor: "{colors.studio-surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
  studio-field:
    backgroundColor: "{colors.studio-field}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0.75rem 0.85rem"
  studio-artwork-cover:
    backgroundColor: "{colors.studio-surface}"
    rounded: "{rounded.artwork}"
---

# Design System: HUX portfolio and Studio manager

## Overview

**Creative North Star: "HUX Studio manager"**

The private dashboard extends the existing HUX identity: deep navy, Plus Jakarta Sans, pale text, and violet and pink accents. Its character is quiet and practical. Artwork remains the visual subject; controls and metadata establish order around it.

This document records the finished dashboard and the shared tokens it inherits. The public portfolio keeps its existing composition, artwork, glass treatments, gradients, and more expressive display typography. Dashboard rules below are scoped to private administration and do not prescribe a redesign of that public surface. Evidence is `src/index.css`, `src/components/auth/Auth.css`, and `src/components/dashboard/Dashboard.css` with the corresponding dashboard components. Review captures are in `.impeccable/review/`; they are QA artifacts, not shipped artwork assets.

**Key Characteristics:**

- Shared navy identity with a quieter private workspace.
- Image-led library and uncropped artwork previews.
- Flat, bordered controls and clear text labels.
- Persistent save actions and explicit publication states.

## Colors

The shared palette combines midnight navy and pale neutral text with blue, violet, and pink; the dashboard adds restrained solid surfaces and stronger field borders.

### Primary

- **Studio blue:** solid primary actions in the dashboard, with a brighter blue hover sibling. These are dashboard values, distinct from the shared public blue.
- **HUX blue:** the inherited public accent token.

### Secondary

- **HUX violet:** the shared brand punctuation, visible in the HUX mark; it also supports the existing public identity.
- **HUX pink:** dashboard title punctuation, caret and field focus; also an inherited public accent.

### Neutral

- **Midnight navy / pale text:** the shared page ground and reading color.
- **Shared muted:** public and authentication supporting copy.
- **Studio surface / field:** flat navy containers and slightly darker form interiors.
- **Studio border / muted:** separators, outlines, labels, metadata, and explanatory copy.
- **Glass fill / border:** inherited public tokens only. They do not define dashboard materials.

Published badges use green text, a dark green fill, and a visible border. Draft badges use pale neutral text over a slate fill. Error and success messages use distinct tinted fills, borders, and readable text. These semantic combinations stay local to the dashboard stylesheet rather than forming a second global accent palette; badge examples also appear in the sidecar.

The sidecar's synthesized tonal ramps are inspector previews only; the frontmatter records the application colors. The application does not consume those ramps.

**The Surface Scope Rule.** Preserve the shared identity tokens while applying flat studio materials only to private administration.

## Typography

**Display and body font:** Plus Jakarta Sans with a sans-serif fallback. No distinct label or monospace face is introduced by the dashboard.

The public display is large and tightly tracked. Dashboard headings are compact enough to keep controls and artwork within reach. Labels use weight and spacing rather than all-caps decoration.

### Hierarchy

- **Display:** inherited public hero role from the frontmatter; responsive public overrides remain in the existing stylesheet.
- **Headline:** dashboard page title; reduces to (2rem) at the mobile breakpoint.
- **Title:** dashboard section headings. Artwork titles use a smaller (1rem) heading with (1.5) line-height.
- **Body:** dashboard reading text and base control text.
- **Label:** field labels and compact explanations; helper text steps down to (0.6875rem).
- **Metadata:** image counts, ordering, account detail, and saving state. Counts and ordering use tabular numerals.

**The Operational Hierarchy Rule.** Keep the page title, section titles, field labels, and helper text visibly distinct without borrowing the public hero scale.

## Layout

The dashboard content and footer use a centered container capped at (1440px). Desktop content has (3rem) horizontal gutters and (3.5rem) vertical padding. The shared public gutter token remains `clamp(1.5rem, 5.5vw, 6rem)` with existing public breakpoint overrides; it is not the studio container rule.

The library uses three columns with (1.75rem) gaps. Its search and filter toolbar is a separate ruled band. At (1099px) and below, the library becomes two columns and the main horizontal gutter becomes (2rem). At (767px) and below, the gutter becomes (1.25rem), search spans the filter row, and headings stack. The library becomes one column at (479px) and below.

The desktop editor pairs a flexible artwork area with a (340px) details rail and a (3rem) gap. At the intermediate breakpoint the rail becomes (290px). On mobile the details precede artwork, the rail divider becomes horizontal, and image actions move beneath their image row. Save controls remain sticky at the bottom and wrap into full-width actions on narrow screens.

Spacing is a practical recurring half-rem to three-rem rhythm, with smaller optical gaps where needed. It is not a mathematically uniform type or spacing scale.

## Elevation & Depth

The dashboard has no decorative shadows or glass blur. Darker field interiors, solid navy surfaces, borders, and ruled sections supply depth. The sticky save bar uses an opaque surface and a border. The inherited public system does use glass and gradients; those remain valid on that surface.

### Shadow Vocabulary

- **Public glass:** `inset 0 1px 0 rgb(255 255 255 / 14%), 0 12px 36px rgb(0 0 20 / 14%)`, with (18px) backdrop blur on the existing public glass panel.
- **Public primary action:** `0 8px 28px rgb(28 68 217 / 24%)`, paired with its existing blue gradient.

**The Flat Studio Rule.** Establish dashboard grouping with spacing, borders, and solid tone before adding depth effects.

## Shapes

Dashboard controls and image previews use gently rounded control corners; larger artwork covers, upload areas, and the desktop save bar use the artwork radius. Shared public panels retain their larger panel radius. Status badges have compact (5px) corners and a small circular indicator; they are labels rather than action pills.

Library covers use a (4:3) frame; editor previews use a square frame. Both display the whole artwork with `object-fit: contain`. Images are not cropped to fill these frames.

## Components

### Buttons

Solid and readable, with text-led actions. Standard dashboard buttons use the control radius, (46px) minimum height, and the padding recorded in frontmatter. The secondary action uses a solid studio surface and border; its hover fill is lighter. Primary actions use studio blue. Danger actions use pale rose text and a rose border on a transparent fill. Icon controls have a (44px) minimum target and accessible labels.

Background and border transitions take (160ms) with `ease`; reduced-motion preference removes those transitions. Buttons and links inherit the shared pale pink focus outline; studio fields use the pink token. Disabled controls have (0.5) opacity.

### Chips

Visibility badges pair a short text label with a color dot. Published and draft remain readable by text, not color alone. They appear over covers and beside editor headings. Category selection uses labelled native checkboxes, not custom action chips.

### Cards / Containers

Library projects are open image-and-text compositions rather than nested bordered cards. The artwork cover carries the radius; the title and category sit below, followed by a ruled metadata row. Hover changes the project heading to pale violet. Loading placeholders preserve the cover aspect ratio without a shimmer animation.

### Inputs / Fields

Dark field interiors have a one-pixel studio border, the control radius, inherited font, and (46px) minimum height for inputs and selects. Textareas resize vertically. Focus is a visible (2px) pink outline with (4px) offset. Errors and successes sit in separate tinted message regions. Labels remain present independently of placeholders; optional and required qualifiers are muted.

### Navigation

The compact HUX header contains the current Artwork destination, a link to the public website, and an account/sign-out area. The current link is white; other links use studio muted text. On narrower screens, secondary brand and account text disappear while the controls remain. A keyboard skip link becomes visible on focus.

### Artwork editor and save bar

An outlined dashed upload area precedes an ordered image list. Each row combines a contained preview, image-description field, dimensions, and labelled native reorder/remove buttons. The first image has a Cover label. The save bar pairs the saving-state text with explicit publication and save actions. This is an artwork-management pattern, not a generic data card.

## Do's and Don'ts

### Do:

- **Do** preserve the public portfolio's existing identity, composition, and local artwork.
- **Do** show complete artwork inside contained preview frames.
- **Do** keep draft, published, loading, empty, error, and saving states explicit in text.
- **Do** keep labels, visible keyboard focus, and reachable save actions on narrow screens.
- **Do** use the dashboard's flat studio surfaces for private administration.

### Don't:

- **Don't** export dashboard density or flatness rules into a public portfolio redesign.
- **Don't** add decorative glass, gradients, metrics, or invented client content to the dashboard.
- **Don't** turn the public surface's existing eyebrow/kicker treatments into a reusable typography rule; those inherited exceptions are not canonized here.
- **Don't** treat review fixtures or QA screenshots as application content or shipped assets.
