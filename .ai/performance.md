# Performance Rules

- Optimize for low CPU, memory, and disk usage.
- Avoid container bloat and unnecessary service duplication.
- Keep startup paths lean inside and outside Docker.
- Favor fast perceived performance.
- Avoid unnecessary rendering and state churn.
- Prefer streaming and progressive disclosure when useful.
- Keep startup paths lean.
- Optimize hotspots after measuring them.

## Reference Benchmarks

- Use the AI SDK guidance as a benchmark for fast, content-first surfaces with predictable state transitions.
- Treat loading, streaming, and empty states as performance-sensitive UI paths.
- Prefer measurable improvements over speculative optimization.
- Keep guidance concrete enough that implementation can be profiled and verified.
