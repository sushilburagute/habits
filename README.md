# Habit Heatmap - Personal Habit Tracker with Visual Streaks

Gamify daily habits with a GitHub-like heatmap, buttery streak animations, and rock solid offline support. 100 percent local. No accounts. Optional browser extension for one-click toggles.

## Features

- Visual heatmap per habit with streak intensity
- Current and longest streaks with micro celebrations
- Offline first PWA using IndexedDB + cache strategies
- Zero backend. All data lives on your device
- Export and import JSON backup
- Dark and light themes with shadcn/ui components

---

## Tech Stack

- React 19 + TypeScript + Vite
- shadcn/ui (Radix primitives + Tailwind 4)
- `idb` wrapper for IndexedDB persistence
- `vite-plugin-pwa` for installable offline shell

---

## Getting started

```bash
yarn install
yarn dev
```

The dev server runs at http://localhost:5173 with hot reload.

### Production build

```bash
yarn build
yarn preview
```

This runs `tsc` for type-checking, builds the PWA bundle, and serves it for smoke testing.

---
