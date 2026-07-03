# shadcn/ui Skill Rules

## Must

- Treat the installed shadcn/ui skill as part of the frontend workflow.
- Read project context before generating UI code.
- Use `components.json` and resolved aliases as the source for paths and base configuration.
- Prefer shadcn component generation and composition patterns over hand-rolled replicas.

## Decision Rule

- Use shadcn/ui when the component exists or can be composed from the registry cleanly.
- Use Watermelon UI only when it is a better registry match and still fits Kaidon tokens and brand rules.
- Use a custom `packages/design-system` component when neither registry path is clean enough.

## Should

- Use `shadcn info --json`-style project context when building or updating UI.
- Check the installed component set before adding duplicates.
- Use the shadcn docs and component patterns to choose the correct primitive.

## Must Not

- Generate UI that ignores the project’s shadcn configuration.
- Assume file paths, aliases, or installed components without checking project context.
- Recreate a shadcn component manually when the installed component or registry entry already covers it.
