# Codex Operating Contract

## Authority Order

1. `docs/FOUNDERS-BLUEPRINT.md`
2. The rest of `docs/` only as derived references
3. `.ai/*.md` rules for implementation guidance
4. `.ai/sonarqube.md` for code quality and maintainability
5. `.ai/docker.md` for container-first runtime and deployment rules
6. `.ai/packages-design-system.md` for shared UI package boundaries
7. `.ai/shadcn-skill.md` for shadcn/ui project-aware UI generation
8. `.ai/brand.md` for Kaidon visual and copy rules
9. `.ai/ui-implementation-spec.md` for stricter UI execution
10. `.ai/ui-architecture.md` for app-wide UI flow, hooks, and component reuse
11. `.ai/implementation-guide.md` for Next.js structure, hooks, and page maps
12. `.ai/marketplace-ui-spec.md` for governed agent marketplace UI

## Must

- Do not create new strategy or roadmap documents unless explicitly requested.
- Implement in small, runnable slices.
- Prefer production-ready code over prototypes.
- Reuse existing standards and open-source conventions.
- Stop after each completed phase and wait for approval.

## Must Not

- Work only inside this repository.
- Do not modify unrelated projects or sibling repositories.
- Do not create unused abstractions.
- Do not invent placeholder implementations.

## Should

- Work only inside this repository.
- Consult the relevant `.ai/*.md` guide before writing code.
