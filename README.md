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

Artwork remains local. Supabase and the administration dashboard are not
implemented in this migration.
