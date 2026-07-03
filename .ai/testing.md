# Testing Rules

- Every nontrivial slice needs verification.
- Prefer tests that protect contracts and critical flows.
- Add regression tests for bugs, not just happy paths.
- Keep tests deterministic and fast enough to run often.
- Verify builds before moving to the next phase.
- Target at least 80% coverage on new or changed core modules unless a lower threshold is justified in writing.
- Critical runtime, contract, and security paths should be covered by tests before merge.
- Prefer integration tests for boundaries and unit tests for pure logic.
- Every new feature should include a success path and at least one failure-path test.
