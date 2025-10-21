# Habit Heatmap

Habit Heatmap is an offline-first habit tracker for the browser. Visualize daily progress with GitHub-style heatmaps, track streaks across multiple views, and keep every data point on-device with optional backups.

## Highlights

- Multi-view dashboard with Today, Week, Overall, and Stats routes driven by `AppContext`.
- Habit cards show current/longest streaks, daily targets, celebratory badges, and responsive heatmaps.
- Quick creation dialog with color palette, optional per-day targets, and same-tab sync via IndexedDB events.
- Workspace tools to seed demo data, reset the local database, and export/import JSON backups.
- Offline-ready PWA shell, theme switching, and responsive UI built from shadcn/ui primitives and Tailwind CSS 4.

## UI at a Glance

- **Today** – toggle today's check-in, view a 28-day heatmap, and celebrate streak continuation.
- **Week** – scan the last 12 weeks (84 days) of activity with cadence context.
- **Overall** – review the current year's streak archive from January 1 through today.
- **Stats** – metrics, leaderboard, and highlighted longest streak powered by live IndexedDB queries.
- **Header utilities** – theme toggle, workspace tools (seed/reset), and backup import/export from the top-right controls.

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4, shadcn/ui, Radix UI primitives, lucide-react icons
- IndexedDB via `idb` with an intra-tab/broadcast event bus (`src/db/sync.ts`)
- date-fns for date math and formatting
- vite-plugin-pwa for manifest/service-worker automation
- ESLint 9 with TypeScript + React rules

## Directory Overview

```text
src/
  App.tsx                # App shell wiring ThemeProvider + AppProvider + dashboard
  components/            # Feature components and shadcn-based UI primitives
    views/               # Route-specific views (Today, Week, Overall, Stats)
  contexts/              # Global state providers (app route + theme)
  db/                    # IndexedDB schema, repo helpers, seed data, and sync event bus
  hooks/                 # React hooks that read/write IndexedDB and compute stats
  utils/backup.ts        # Export/import helpers for JSON backups
  index.css              # Tailwind layers and CSS variables for dark/light themes
public/
  icons/                 # PWA icon set referenced by the Vite PWA manifest
```

## Getting Started

1. Install dependencies with Yarn (lockfile is authoritative):
   ```bash
   yarn install
   ```
2. Start the Vite dev server:
   ```bash
   yarn dev
   ```
   The app runs at http://localhost:5173 with hot module reload.

Target Node.js 20 LTS or newer; Vite 7 will enforce modern ESM support.

## Scripts

- `yarn dev` – run the development server.
- `yarn build` – type-check via `tsc -b` then create a production build in `dist/`.
- `yarn preview` – serve the latest build locally for smoke-testing the PWA shell.
- `yarn lint` – run ESLint with the TypeScript + React profile; treat warnings as actionable.

## Data & Persistence

- All state lives in IndexedDB (`habits`, `ticks`, `meta` stores) initialized in `src/db/index.ts`.
- Repository helpers in `src/db/repo.ts` encapsulate CRUD, streak computation, and range queries.
- React hooks in `src/hooks/useDB.ts` and `src/hooks/useStats.ts` subscribe to `onDBEvent` so UI updates instantly after any tab writes.
- The Backup menu lets you export/import JSON payloads (`src/utils/backup.ts`). Restores clear the current database before replaying the payload.
- Workspace tools can seed realistic demo data (`src/db/seed.ts`) or reset the entire workspace.

## PWA & Offline Testing

- The PWA manifest and service worker are configured in `vite.config.ts` via `vite-plugin-pwa`.
- Run `yarn build` followed by `yarn preview` and open the preview URL to verify installability and offline behaviour in a fresh browser profile.
- Runtime caching currently includes an example API origin (`api.example.com`); update this before shipping a production build.

## Development Notes

- Use the `@/` alias (declared in `tsconfig.app.json`) instead of deep relative imports.
- UI primitives under `src/components/ui/` wrap Radix components with Tailwind styling; reuse them for consistent theming.
- Tailwind tokens and CSS variables are defined in `src/index.css`. Theme switching persists via `ThemeProvider`.
- When changing data schema or PWA files (`src/db/*`, `public/icons`, `vite.config.ts`), verify offline caching and migrations manually.
- The top-right header controls offer theme toggle, workspace operations, and backups—handy during manual QA.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
