export type RuntimeAgentReference = {
  id: string;
  name: string;
  version: string;
};

export type RuntimeStatus =
  | "queued"
  | "starting"
  | "running"
  | "waiting"
  | "checkpointed"
  | "retrying"
  | "succeeded"
  | "failed"
  | "canceled";

export type RuntimeEventType =
  | "run.created"
  | "run.started"
  | "run.updated"
  | "run.checkpointed"
  | "run.retried"
  | "run.canceled"
  | "run.completed"
  | "task.created"
  | "task.started"
  | "task.updated"
  | "task.waiting"
  | "task.succeeded"
  | "task.failed"
  | "task.canceled"
  | "tool.started"
  | "tool.completed"
  | "retrieval.started"
  | "retrieval.completed"
  | "approval.requested"
  | "approval.granted"
  | "approval.denied"
  | "memory.read"
  | "memory.write";

export type RuntimeEvent = {
  type: RuntimeEventType;
  at: string;
  message: string;
  data?: Record<string, unknown>;
};

export type RuntimeCheckpoint = {
  id: string;
  status: RuntimeStatus;
  at: string;
  note: string;
};

export type RuntimeRun = {
  id: string;
  agentId: string;
  taskId: string;
  status: RuntimeStatus;
  progress: number;
  currentStep: string;
  events: RuntimeEvent[];
  checkpoints: RuntimeCheckpoint[];
  createdAt: string;
  updatedAt: string;
};

export type RuntimeTask = {
  id: string;
  agent: RuntimeAgentReference;
  status: RuntimeStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  checkpoints: RuntimeCheckpoint[];
  events: RuntimeEvent[];
  updatedAt: string;
};

export function createRuntimeEvent(
  type: RuntimeEventType,
  message: string,
  data?: Record<string, unknown>,
): RuntimeEvent {
  return {
    type,
    at: new Date().toISOString(),
    message,
    ...(data ? { data } : {}),
  };
}

export function createRuntimeCheckpoint(
  taskId: string,
  status: RuntimeStatus,
  note: string,
): RuntimeCheckpoint {
  return {
    id: `cp_${taskId}_${Date.now()}`,
    status,
    at: new Date().toISOString(),
    note,
  };
}

export function createRuntimeRun(agentId: string, taskId: string): RuntimeRun {
  const now = new Date().toISOString();

  return {
    id: `run_${taskId}`,
    agentId,
    taskId,
    status: "queued",
    progress: 0,
    currentStep: "Queued",
    events: [],
    checkpoints: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const sampleRuntimeRun: RuntimeRun = {
  id: "run_sample-agent_task_sample-task",
  agentId: "sample-agent",
  taskId: "task_sample-task",
  status: "running",
  progress: 42,
  currentStep: "Collecting live research results.",
  events: [
    {
      type: "run.created",
      at: "2026-07-03T00:00:00.000Z",
      message: "Run created for sample agent.",
    },
    {
      type: "run.started",
      at: "2026-07-03T00:00:05.000Z",
      message: "Run started from queue.",
    },
  ],
  checkpoints: [
    {
      id: "cp_task_sample-task_1",
      status: "running",
      at: "2026-07-03T00:00:20.000Z",
      note: "Saved after planning.",
    },
  ],
  createdAt: "2026-07-03T00:00:00.000Z",
  updatedAt: "2026-07-03T00:00:20.000Z",
};
