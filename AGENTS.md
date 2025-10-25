# Repository Guidelines

## Project Structure & Module Organization
The Vite + React + TypeScript app lives in . Feature UI components stay in , with shared primitives under . Global state providers live in , and IndexedDB logic is isolated in  alongside hooks in  and utility helpers in . Static assets, icons, and the manifest belong in . The PWA shell is anchored by , , and app composition in . Use the  alias (configured in ) when importing from .

## Build, Test, and Development Commands
-  — install dependencies; prefer Yarn to keep the lockfile authoritative.
-  — start the Vite dev server on localhost with hot reload.
-  — type-check via  then generate the production bundle in .
-  — serve the latest build for smoke-testing the PWA shell.
-  — run ESLint with the TypeScript + React profile; treat warnings as actionable.

## Coding Style & Naming Conventions
Code is TypeScript-first with functional React components. Use 2-space indentation, explicit return types on shared utilities, and keep component files PascalCase (e.g., ). Hooks should follow the  naming convention and live in . Favor  imports over deep relative paths. Tailwind utility classes may be grouped with  from .

## Testing Guidelines
 holds unit and integration specs; co-locate supporting fixtures nearby. We have not committed a test runner yet—plan on Vitest and Testing Library, and include setup changes when adding the first suite. Until automation lands, document manual verification steps in pull requests and rely on  before opening a PR.

## Commit & Pull Request Guidelines
Follow the short-prefix commit style visible in history (e.g., , , ) followed by a concise description. Each PR should describe scope, link related issues, and call out UI changes with before/after screenshots or recordings from . Note any service worker or caching impacts to help reviewers validate offline behavior.

## PWA & Offline Notes
Changes touching , , or  can affect installability and data safety. After such updates, verify install, offline caches, and IndexedDB migrations by running  and testing in a fresh browser profile.
