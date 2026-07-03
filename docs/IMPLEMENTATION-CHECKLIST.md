# Phase 1 Implementation Checklist

## Source Of Truth

This checklist is a build aid derived from `FOUNDERS-BLUEPRINT.md` and
`IMPLEMENTATION-BLUEPRINT.md`.
It is only for execution order and should not override the blueprint.

## Goal

Start the monorepo foundation and make the repository ready for incremental
implementation.

## 1. Repo Scaffolding

- Create the workspace directory layout for `apps/`, `packages/`, and
  `templates/`.
- Add the minimal package folders needed for the first build slice.
- Establish consistent naming for app, package, and shared directories.
- Keep the structure shallow and easy to extend.

## 2. Workspace Config

- Add the root workspace configuration for the monorepo.
- Define package manager and workspace resolution rules.
- Add base TypeScript and linting configuration shared across the workspace.
- Add build scripts that can run from the repo root.
- Keep the configuration compatible with incremental expansion.

## 3. Design-System Package Skeleton

- Create `packages/design-system`.
- Add the scaffold defined in `.ai/packages-design-system.md`.
- Add token, component, style, utility, and type entrypoints.
- Expose the public surface from `src/index.ts`.
- Keep the package reusable and independent from app routes.

## 4. App Shell Skeleton

- Create `apps/web` with the Next.js route structure from
  `.ai/implementation-guide.md`.
- Add the application shell, navigation placeholder, and page layout entry.
- Wire the shell to the shared design system instead of local UI copies.
- Add a minimal homepage or runtime landing route that proves the shell works.
- Keep the shell ready for the Runtime, SDK, CLI, Studio, and Cloud sections.

## 5. Verification

- Confirm the workspace installs cleanly.
- Confirm the build and lint entrypoints are present.
- Confirm the design system package exports a public surface.
- Confirm the web app boots through the shell without feature logic.

## Exit Criteria

- The repo has a valid monorepo structure.
- The shared design-system package exists.
- The app shell exists and composes the shared layer.
- The next phase can start without restructuring the repo.

