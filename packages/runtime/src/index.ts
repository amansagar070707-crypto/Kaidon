import type { AgentDefinition } from "@kaidon/apl";
import {
  createRuntimeCheckpoint,
  createRuntimeEvent,
  createRuntimeRun,
  sampleRuntimeRun,
  type RuntimeAgentReference,
  type RuntimeCheckpoint,
  type RuntimeEvent,
  type RuntimeEventType,
  type RuntimeTask,
  type RuntimeRun,
  type RuntimeStatus,
} from "../../runtime-protocol/src";

export {
  createRuntimeCheckpoint,
  createRuntimeEvent,
  createRuntimeRun,
  sampleRuntimeRun,
  type RuntimeAgentReference,
  type RuntimeCheckpoint,
  type RuntimeEvent,
  type RuntimeEventType,
  type RuntimeRun,
  type RuntimeStatus,
  type RuntimeTask,
};

export function createRuntimeTask(agent: AgentDefinition, input: Record<string, unknown>): RuntimeTask {
  return {
    id: `task_${agent.id}_${Date.now()}`,
    agent: {
      id: agent.id,
      name: agent.name,
      version: agent.version,
    },
    status: "queued",
    input,
    checkpoints: [],
    events: [
      {
        type: "task.created",
        at: new Date().toISOString(),
        message: `Task created for ${agent.name}.`,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function createRuntimeRunState(task: RuntimeTask): RuntimeRun {
  const now = new Date().toISOString();

  return {
    id: `run_${task.id}`,
    agentId: task.agent.id,
    taskId: task.id,
    status: task.status,
    progress: 0,
    currentStep: "Queued",
    events: [
      {
        type: "run.created",
        at: now,
        message: `Run created for ${task.agent.name}.`,
      },
    ],
    checkpoints: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function startRuntimeRun(run: RuntimeRun, message = "Run started from queue."): RuntimeRun {
  return updateRuntimeRun(run, "starting", 8, "Starting", "run.started", message);
}

export function advanceRuntimeRun(
  run: RuntimeRun,
  options: {
    message: string;
    progress: number;
    currentStep: string;
    eventType?: RuntimeEventType;
  },
): RuntimeRun {
  return updateRuntimeRun(
    run,
    "running",
    options.progress,
    options.currentStep,
    options.eventType ?? "run.updated",
    options.message,
  );
}

export function checkpointRuntimeRun(run: RuntimeRun, note: string): RuntimeRun {
  const checkpoint = createRuntimeCheckpoint(run.taskId, "checkpointed", note);

  return {
    ...run,
    status: "checkpointed",
    checkpoints: [...run.checkpoints, checkpoint],
    updatedAt: checkpoint.at,
    events: [
      ...run.events,
      {
        type: "run.checkpointed",
        at: checkpoint.at,
        message: `Checkpoint saved: ${note}`,
      },
    ],
  };
}

export function retryRuntimeRun(run: RuntimeRun, note: string): RuntimeRun {
  const checkpointed = checkpointRuntimeRun(run, `retry requested: ${note}`);

  return {
    ...checkpointed,
    status: "retrying",
    events: [
      ...checkpointed.events,
      {
        type: "run.retried",
        at: new Date().toISOString(),
        message: `Run queued for retry: ${note}`,
      },
    ],
  };
}

export function cancelRuntimeRun(run: RuntimeRun, note: string): RuntimeRun {
  return updateRuntimeRun(
    run,
    "canceled",
    run.progress,
    "Canceled",
    "run.canceled",
    `Run canceled: ${note}`,
  );
}

export function completeRuntimeRun(
  run: RuntimeRun,
  message: string,
  output?: Record<string, unknown>,
): RuntimeRun {
  return {
    ...run,
    status: "succeeded",
    progress: 100,
    currentStep: "Complete",
    updatedAt: new Date().toISOString(),
    events: [
      ...run.events,
      {
        type: "run.completed",
        at: new Date().toISOString(),
        message,
        ...(output ? { data: output } : {}),
      },
    ],
  };
}

export function transitionTask(
  task: RuntimeTask,
  status: RuntimeStatus,
  message: string,
  output?: Record<string, unknown>,
): RuntimeTask {
  const eventTypeMap: Record<RuntimeStatus, RuntimeEventType | null> = {
    queued: null,
    starting: "task.started",
    running: "task.started",
    waiting: "task.waiting",
    checkpointed: "task.updated",
    retrying: "task.updated",
    succeeded: "task.succeeded",
    failed: "task.failed",
    canceled: "task.canceled",
  };

  const nextEventType = eventTypeMap[status];

  return {
    ...task,
    status,
    output: output ?? task.output,
    updatedAt: new Date().toISOString(),
    events: nextEventType
      ? [
          ...task.events,
          {
            type: nextEventType,
            at: new Date().toISOString(),
            message,
          },
        ]
      : task.events,
  };
}

export function checkpointTask(task: RuntimeTask, note: string): RuntimeTask {
  const checkpoint: RuntimeCheckpoint = {
    id: `cp_${task.id}_${task.checkpoints.length + 1}`,
    status: task.status,
    at: new Date().toISOString(),
    note,
  };

  return {
    ...task,
    checkpoints: [...task.checkpoints, checkpoint],
    updatedAt: checkpoint.at,
    events: [
      ...task.events,
      {
        type: "task.updated",
        at: checkpoint.at,
        message: `Checkpoint saved: ${note}`,
      },
    ],
  };
}

export function retryTask(task: RuntimeTask, note: string): RuntimeTask {
  const retry = checkpointTask(task, `retry requested: ${note}`);

  return {
    ...retry,
    status: "queued",
    events: [
      ...retry.events,
      {
        type: "task.updated",
        at: new Date().toISOString(),
        message: `Task moved back to queue: ${note}`,
      },
    ],
  };
}

export function cancelTask(task: RuntimeTask, note: string): RuntimeTask {
  return transitionTask(task, "canceled", `Task canceled: ${note}`);
}

function updateRuntimeRun(
  run: RuntimeRun,
  status: RuntimeStatus,
  progress: number,
  currentStep: string,
  eventType: RuntimeEventType,
  message: string,
): RuntimeRun {
  const timestamp = new Date().toISOString();

  return {
    ...run,
    status,
    progress,
    currentStep,
    updatedAt: timestamp,
    events: [
      ...run.events,
      {
        type: eventType,
        at: timestamp,
        message,
      },
    ],
  };
}
