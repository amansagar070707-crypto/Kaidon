# Docker Architecture Rules

## Must

- Treat Docker as the default runtime and deployment boundary.
- Prefer containerized services over host-specific setup.
- Keep images small, reproducible, and production-oriented.
- Design services to run with modest CPU, memory, and disk usage.
- Keep container responsibilities narrow and composable.

## Should

- Use multi-stage builds when they reduce runtime size or attack surface.
- Avoid heavyweight base images when a smaller standard image works.
- Make local development match container behavior as closely as possible.
- Prefer free and open-source dependencies when they satisfy the requirement.
- Avoid paid, proprietary, or cloud-locked runtime assumptions unless explicitly required.
- Optimize for resource efficiency without sacrificing correctness or observability.
- Prefer stateless containers where state can live in PostgreSQL or another durable store.

## Budgets

- Memory: 512 MB or less for most services.
- CPU: 1 vCPU or less for most services.
- Image size: keep runtime images as small as practical.

## Must Not

- Treat host-specific setup as the default path.
- Build around wasteful resource usage.

## Exceptions

- Document any exception to resource budgets in code or deployment config.
