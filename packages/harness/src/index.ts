import { createAgentDefinition, type AgentDefinition } from "@kaidon/apl";
import { resolveOpenRouterModel, type GeneratedAgentDraft } from "@kaidon/llm";
import {
  advanceRuntimeRun,
  cancelRuntimeRun,
  checkpointRuntimeRun,
  completeRuntimeRun,
  createRuntimeRunState,
  createRuntimeTask,
  retryRuntimeRun,
  startRuntimeRun,
  type RuntimeTask,
} from "@kaidon/runtime";
import type { RuntimeRun } from "../../runtime-protocol/src";

export type HarnessRequest = {
  id: string;
  prompt: string;
  requestedBy: string;
  createdAt: string;
};

export type HarnessWorkItem = {
  id: string;
  requestId: string;
  title: string;
  summary: string;
  assignedAgent: string;
  status: "captured" | "assigned" | "generating" | "ready";
};

export type HarnessAssignment = {
  request: HarnessRequest;
  workItem: HarnessWorkItem;
  generatedAgent: AgentDefinition;
  task: RuntimeTask;
  run: RuntimeRun;
};

export type HarnessGeneration = {
  source: "live" | "fallback";
  error?: string;
};

export function createHarnessRequest(
  prompt: string,
  requestedBy: string,
): HarnessRequest {
  return {
    id: `req_${Date.now()}`,
    prompt,
    requestedBy,
    createdAt: new Date().toISOString(),
  };
}

export function createHarnessWorkItem(
  request: HarnessRequest,
  assignedAgent = "agent-builder",
): HarnessWorkItem {
  const slug = slugify(request.prompt);

  return {
    id: `work_${slug}`,
    requestId: request.id,
    title: `Generate ${slug}`,
    summary: request.prompt,
    assignedAgent,
    status: "assigned",
  };
}

export function generateAgentFromRequest(request: HarnessRequest): AgentDefinition {
  return generateAgentFromDraft(request, createFallbackDraftFromRequest(request));
}

export function generateAgentFromDraft(
  request: HarnessRequest,
  draft: GeneratedAgentDraft,
): AgentDefinition {
  const slug = slugify(request.prompt);

  return createAgentDefinition({
    id: slug,
    name: draft.name || slug,
    version: "0.1.0",
    description: draft.description,
    model: resolveOpenRouterModel(),
    tools: draft.tools,
    memory: draft.memory,
    status: "ready",
  });
}

export function assignHarnessRequest(
  prompt: string,
  requestedBy = "studio-user",
): HarnessAssignment {
  return assignHarnessRequestFromDraft(
    prompt,
    createFallbackDraftFromRequest(createHarnessRequest(prompt, requestedBy)),
    requestedBy,
  );
}

export function assignHarnessRequestFromDraft(
  prompt: string,
  draft: GeneratedAgentDraft,
  requestedBy = "studio-user",
): HarnessAssignment {
  const request = createHarnessRequest(prompt, requestedBy);
  const workItem = createHarnessWorkItem(request);
  const generatedAgent = generateAgentFromDraft(request, draft);
  const task = createRuntimeTask(generatedAgent, {
    requestId: request.id,
    workItemId: workItem.id,
    prompt: request.prompt,
  });
  const seedRun = createRuntimeRunState(task);
  const runningRun = startRuntimeRun(seedRun, "Runtime picked up the run.");
  const steppedRun = advanceRuntimeRun(runningRun, {
    message: "Planner started for the prompt.",
    progress: 18,
    currentStep: "Planning the execution path.",
    eventType: "run.updated",
  });
  const checkpointedRun = checkpointRuntimeRun(
    steppedRun,
    "Saved initial planning checkpoint.",
  );
  const retriedRun = retryRuntimeRun(
    checkpointedRun,
    "Awaiting downstream search result collection.",
  );
  const canceledRun = completeRuntimeRun(
    retriedRun,
    "Run completed with generated agent draft.",
    {
      agentId: generatedAgent.id,
      taskId: task.id,
    },
  );
  const run: RuntimeRun = canceledRun;

  return {
    request,
    workItem: {
      ...workItem,
      status: "generating",
    },
    generatedAgent,
    task,
    run,
  };
}

function createFallbackDraftFromRequest(
  request: HarnessRequest,
): GeneratedAgentDraft {
  const wantsApproval = /approval|approve|refund/i.test(request.prompt);
  const wantsBilling = /billing|invoice|refund|payment/i.test(request.prompt);
  const slug = slugify(request.prompt);

  return {
    name: slug,
    description: request.prompt.trim(),
    tools: [
      {
        id: wantsBilling ? "tool_billing" : "tool_search",
        name: wantsBilling ? "Billing lookup" : "Search",
        required: true,
      },
      {
        id: wantsApproval ? "tool_approval" : "tool_email",
        name: wantsApproval ? "Approval" : "Email",
        required: true,
      },
    ],
    memory: {
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
    },
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "generated-agent";
}
