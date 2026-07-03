# Backend Rules

- Treat persistence and runtime state as production concerns.
- Use typed contracts for service boundaries.
- Make failure states explicit.
- Emit structured events for actions that matter.
- Prefer durable storage and replayable workflows over in-memory behavior.

## Reference Benchmarks

- Use the AI SDK implementation guidance as a benchmark for clarity, contract discipline, and testable behavior.
- Keep backend rules implementation-focused, with explicit inputs, outputs, and failure states.
- Favor structured, replayable, and observable workflows over hidden side effects.
- Treat every service boundary as a contract that must be validated in code and tests.
