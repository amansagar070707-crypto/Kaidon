export type KaidonComponentCategory =
  | "card"
  | "table"
  | "timeline"
  | "approval"
  | "log"
  | "graph"
  | "artifact"
  | "markdown"
  | "form"
  | "command"
  | "developer-panel";

export type KaidonComponentProps = Record<string, unknown>;

export type KaidonComponentDefinition = {
  id: string;
  name: string;
  category: KaidonComponentCategory;
  description: string;
  tags: string[];
  public: boolean;
};

export type KaidonRenderedComponent = {
  definition: KaidonComponentDefinition;
  props: KaidonComponentProps;
  children?: unknown;
};

export const kaidonComponentRegistry: KaidonComponentDefinition[] = [
  {
    id: "runtime-status-card",
    name: "Runtime Status Card",
    category: "card",
    description: "Compact runtime summary for a run, task, and live progress.",
    tags: ["runtime", "status", "summary"],
    public: true,
  },
  {
    id: "runtime-event-timeline",
    name: "Runtime Event Timeline",
    category: "timeline",
    description: "Expandable event stream for tool calls, checkpoints, and traces.",
    tags: ["events", "trace", "timeline"],
    public: true,
  },
  {
    id: "approval-panel",
    name: "Approval Panel",
    category: "approval",
    description: "Human-in-the-loop decision surface for sensitive actions.",
    tags: ["approval", "policy", "safety"],
    public: true,
  },
  {
    id: "developer-panel",
    name: "Developer Panel",
    category: "developer-panel",
    description: "A reusable operator surface for logs, metrics, and progress.",
    tags: ["developer", "ops", "inspection"],
    public: true,
  },
];

export function getRegisteredComponent(id: string) {
  return kaidonComponentRegistry.find((entry) => entry.id === id) ?? null;
}

export function listPublicComponents() {
  return kaidonComponentRegistry.filter((entry) => entry.public);
}
