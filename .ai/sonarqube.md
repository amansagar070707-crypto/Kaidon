# Code Quality Standard

Follow Sonar-style quality rules when generating or changing code.

## Must

- Maximum function length: 40 lines, excluding blank lines and comments.
- Maximum nesting depth: 3 levels.
- Maximum cyclomatic complexity: 10 for ordinary functions, 15 for core orchestration code only when justified.
- Maximum file length: 400 lines unless the file is a generated contract, schema, or fixture.
- Maximum parameter count: 5 parameters per function unless a typed object is clearer.
- Maximum duplicated logic: do not repeat the same business rule in more than one place.
- Maximum module coupling: a module should depend only on the interfaces it needs.

## Should

- Keep code simple and readable.
- Remove duplication instead of copying patterns.
- Limit nesting and avoid deeply coupled logic.
- Keep functions small and focused on one responsibility.
- Make behavior testable with clear boundaries.
- Prefer explicit names over clever shortcuts.
- Fix smells at the source instead of papering over them.
- Preserve maintainability, reliability, and clarity over shortcuts.
- Do not increase technical debt for convenience.

## Must Not

- Refactor when code exceeds the thresholds unless there is a documented exception.
- Ignore repeated warning signs or solve them with comments alone.

## Should

- Prefer splitting logic into smaller units over adding control-flow complexity.
- Prefer typed data structures over long positional argument lists.
- Add or update tests when a rule or boundary changes.
- Treat repeated warning signs as code smells that need structural fixes, not comments.
