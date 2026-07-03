# Architecture Rules

- Use a Docker-first architecture.
- Assume services run in containers unless a strong reason says otherwise.
- Keep resource usage modest and predictable.
- Prefer free and open-source building blocks where possible.
- Keep modules small and replaceable.
- Define clear interfaces before implementations.
- Prefer composition over inheritance.
- Do not add abstractions unless they remove real duplication or coupling.
- Keep runtime, SDK, CLI, and UI boundaries explicit.
