import {
  createContextSnapshot,
  createMemoryItem,
  createMemoryPolicy,
  countVisibleContextTokens,
} from "@kaidon/memory";
import {
  createToolDefinition,
  listEnabledTools,
  registerTool,
} from "@kaidon/tools";
import {
  assignHarnessRequest,
  type HarnessAssignment,
  type HarnessGeneration,
} from "@kaidon/harness";
import {
  cancelTask,
  checkpointTask,
  createRuntimeTask,
  retryTask,
  transitionTask,
  type RuntimeTask,
} from "@kaidon/runtime";

export const DEFAULT_HARNESS_PROMPT =
  "Create a job hunting agent that finds 2026 AI engineer roles, ranks matches, drafts outreach, and tracks applications in workspace memory.";

export type HarnessViewModel = {
  assignment: HarnessAssignment;
  generation: HarnessGeneration;
  runningTask: RuntimeTask;
  checkpointedTask: RuntimeTask;
  retriedTask: RuntimeTask;
  canceledTask: RuntimeTask;
  enabledTools: ReturnType<typeof listEnabledTools>;
  contextSnapshot: ReturnType<typeof createContextSnapshot>;
  visibleContextTokens: number;
  timeline: {
    query: string;
    stage: string;
    progress: number;
    remainingSteps: number;
    phases: Array<{
      id: string;
      label: string;
      status: string;
      hint: string;
    }>;
    events: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      at: string;
      state: string;
    }>;
    lastUpdatedAt: string;
  };
  research: {
    query: string;
    status: string;
    progress: number;
    completedSteps: number;
    totalSteps: number;
    currentStep: string;
    sources: string[];
    results: Array<{
      title: string;
      url: string;
      snippet: string;
      source: string;
    }>;
    lastUpdatedAt: string;
  };
};

export function createHarnessViewModel(
  prompt = DEFAULT_HARNESS_PROMPT,
  generation: HarnessGeneration = { source: "fallback" },
  assignment = assignHarnessRequest(prompt),
): HarnessViewModel {
  const runningTask = transitionTask(
    createRuntimeTask(assignment.generatedAgent, assignment.task.input),
    "running",
    "Task picked up by runtime.",
  );
  const checkpointedTask = checkpointTask(
    runningTask,
    "Billing lookup checkpoint saved.",
  );
  const retriedTask = retryTask(
    checkpointedTask,
    "Awaiting billing service timeout.",
  );
  const canceledTask = cancelTask(
    retriedTask,
    "User closed request.",
  );

  const toolRegistry = registerTool(
    createToolDefinition({
      id: "tool_billing",
      name: "Billing lookup",
      description: "Lookup invoices and payment state.",
      scope: "workspace",
      transport: "mcp",
      permissions: ["read"],
      version: "0.1.0",
    }),
    registerTool(
      createToolDefinition({
        id: "tool_approval",
        name: "Approval",
        description: "Send approval requests for high-impact actions.",
        scope: "workspace",
        transport: "http",
        permissions: ["approve"],
        version: "0.1.0",
      }),
    ),
  );

  const memoryPolicy = createMemoryPolicy({
    scope: "workspace",
    retentionDays: 30,
    encrypted: true,
    allowRetrieval: true,
  });

  const contextSnapshot = createContextSnapshot({
    agentId: assignment.generatedAgent.id,
    summary: "Workspace context preserved for current support workflow.",
    items: [
      createMemoryItem({
        id: "mem_1",
        scope: "workspace",
        content: "Billing lookup allowed for support escalation.",
        source: assignment.task.id,
      }),
      createMemoryItem({
        id: "mem_2",
        scope: "session",
        content: "Customer ticket asks for invoice correction.",
        source: assignment.task.id,
      }),
    ],
    budget: {
      maxTokens: 8192,
      reservedTokens: 1024,
      compressionEnabled: true,
    },
    policy: memoryPolicy,
  });

  return {
    assignment,
    generation,
    runningTask,
    checkpointedTask,
    retriedTask,
    canceledTask,
    enabledTools: listEnabledTools(toolRegistry),
    contextSnapshot,
    visibleContextTokens: countVisibleContextTokens(contextSnapshot),
    timeline: {
      query: prompt,
      stage: "Research",
      progress: 12,
      remainingSteps: 5,
      phases: [
        { id: "discover", label: "Discover", status: "complete", hint: "Clarify request and constraints." },
        { id: "search", label: "Search", status: "active", hint: "Check approved sources." },
        { id: "rank", label: "Rank", status: "pending", hint: "Compare matches and trade-offs." },
        { id: "draft", label: "Draft", status: "pending", hint: "Prepare output for the user." },
        { id: "track", label: "Track", status: "pending", hint: "Persist the result for follow-up." },
      ],
      events: runningTask.events.map((event, index) => ({
        id: `${runningTask.id}_timeline_${index + 1}`,
        type: event.type,
        title: event.type.replace(/\./g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
        description: event.message,
        at: event.at,
        state: index === 0 ? "started" : "active",
      })),
      lastUpdatedAt: runningTask.updatedAt,
    },
    research: {
      query: prompt,
      status: assignment.task.status,
      progress: 12,
      completedSteps: 0,
      totalSteps: 6,
      currentStep: "Waiting for runtime execution.",
      sources: ["Search", "Memory", "Planner"],
      results: [],
      lastUpdatedAt: assignment.request.createdAt,
    },
  };
}

export const harnessViewModel = createHarnessViewModel();
export const assignment = harnessViewModel.assignment;
export const runningTask = harnessViewModel.runningTask;
export const checkpointedTask = harnessViewModel.checkpointedTask;
export const retriedTask = harnessViewModel.retriedTask;
export const canceledTask = harnessViewModel.canceledTask;
export const enabledTools = harnessViewModel.enabledTools;
export const contextSnapshot = harnessViewModel.contextSnapshot;
export const visibleContextTokens = harnessViewModel.visibleContextTokens;
