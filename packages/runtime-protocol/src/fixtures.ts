import {
  createRuntimeCheckpoint,
  createRuntimeEvent,
  createRuntimeRun,
  sampleRuntimeRun,
  type RuntimeTask,
} from "./index";

export const sampleRuntimeTask: RuntimeTask = {
  id: "task_sample-runtime-task",
  agent: {
    id: "sample-research-agent",
    name: "Sample Research Agent",
    version: "0.1.0",
  },
  status: "running",
  input: {
    prompt: "Find 2026 AI engineer jobs.",
  },
  checkpoints: [
    createRuntimeCheckpoint("task_sample-runtime-task", "running", "Saved after planning."),
  ],
  events: [
    createRuntimeEvent("task.created", "Task created for sample agent."),
    createRuntimeEvent("task.started", "Run started from queue."),
  ],
  updatedAt: new Date().toISOString(),
};

export const sampleRuntimeRunContract = createRuntimeRun(
  sampleRuntimeTask.agent.id,
  sampleRuntimeTask.id,
);

export const sampleRuntimeRunFixture = sampleRuntimeRun;
