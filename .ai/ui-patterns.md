# Agent UI Patterns

- Use a single visual language across agent, memory, tool, and workflow surfaces.
- Prefer `shadcn/ui`-backed primitives for common controls and layouts.
- Use specialized libraries only when they improve accessibility, motion, or interaction quality.
- Thinking states must show progress, not blank spinners.
- Streaming states must visibly update content.
- Tool execution should be represented as a timeline or log.
- Approvals must be explicit and interrupt the flow clearly.
- Memory, retrieval, and workflow states should be distinguishable.
- Use progressive disclosure for complex agent reasoning.

## No-Code Builder Pattern

- The primary screen should support a natural-language prompt as the first input, not a buried secondary action.
- The prompt field should accept intent such as "I want to build a customer support agent with billing lookup and approvals."
- The prompt should drive a visual builder canvas, not replace it.
- The UI should show the generated graph, the generated TypeScript SDK equivalent, and sync status side by side.
- The user should be able to switch between visual editing and code editing without losing state.
- Changes in either mode should update the other mode through explicit 2-way sync.
- The builder should show draft, syncing, synced, conflict, and needs-review states.
- The builder should expose reusable blocks for tools, prompts, memory, approvals, and workflow steps.
- Long prompts should collapse into editable intent summaries after generation.
- Empty states should suggest example goals instead of a blank editor.
