import { describe, it, expect } from "vitest";
import {
  createRuntimeTask,
  createRuntimeRunState,
  startRuntimeRun,
  advanceRuntimeRun,
  checkpointRuntimeRun,
  retryRuntimeRun,
  cancelRuntimeRun,
  completeRuntimeRun,
  transitionTask,
  checkpointTask,
  retryTask,
  cancelTask,
} from "./index";
import { sampleAgentDefinition } from "../../apl/src/fixtures";

describe("createRuntimeTask", () => {
  it("should create a task with correct initial state", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test prompt" });

    expect(task.id).toContain("sample-research-agent");
    expect(task.status).toBe("queued");
    expect(task.input).toEqual({ prompt: "Test prompt" });
    expect(task.agent.id).toBe("sample-research-agent");
    expect(task.agent.name).toBe("Sample Research Agent");
    expect(task.events).toHaveLength(1);
    expect(task.events[0].type).toBe("task.created");
  });
});

describe("createRuntimeRunState", () => {
  it("should create a run from a task", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);

    expect(run.id).toContain("run_");
    expect(run.agentId).toBe("sample-research-agent");
    expect(run.taskId).toBe(task.id);
    expect(run.status).toBe("queued");
    expect(run.progress).toBe(0);
    expect(run.events).toHaveLength(1);
    expect(run.checkpoints).toHaveLength(0);
  });
});

describe("Runtime Run State Transitions", () => {
  it("should transition from queued to starting", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);

    expect(started.status).toBe("starting");
    expect(started.progress).toBe(8);
    expect(started.events).toHaveLength(2);
  });

  it("should advance with progress", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);
    const advanced = advanceRuntimeRun(started, {
      message: "Searching...",
      progress: 50,
      currentStep: "Search Phase",
    });

    expect(advanced.status).toBe("running");
    expect(advanced.progress).toBe(50);
    expect(advanced.currentStep).toBe("Search Phase");
  });

  it("should create a checkpoint", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);
    const checkpointed = checkpointRuntimeRun(started, "Saved progress");

    expect(checkpointed.status).toBe("checkpointed");
    expect(checkpointed.checkpoints).toHaveLength(1);
    expect(checkpointed.checkpoints[0].note).toBe("Saved progress");
  });

  it("should retry from checkpoint", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);
    const checkpointed = checkpointRuntimeRun(started, "Before retry");
    const retried = retryRuntimeRun(checkpointed, "Try again");

    expect(retried.status).toBe("retrying");
    expect(retried.checkpoints.length).toBeGreaterThanOrEqual(1);
    expect(retried.events.some((e) => e.type === "run.retried")).toBe(true);
  });

  it("should cancel a run", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);
    const canceled = cancelRuntimeRun(started, "User stopped");

    expect(canceled.status).toBe("canceled");
    expect(canceled.currentStep).toBe("Canceled");
  });

  it("should complete a run with output", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const run = createRuntimeRunState(task);
    const started = startRuntimeRun(run);
    const completed = completeRuntimeRun(started, "Done!", { resultCount: 5 });

    expect(completed.status).toBe("succeeded");
    expect(completed.progress).toBe(100);
    expect(completed.currentStep).toBe("Complete");
    expect(completed.events.some((e) => e.type === "run.completed")).toBe(true);
  });
});

describe("Task State Transitions", () => {
  it("should transition task through states", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });

    const started = transitionTask(task, "running", "Task started");
    expect(started.status).toBe("running");

    const waiting = transitionTask(started, "waiting", "Waiting for input");
    expect(waiting.status).toBe("waiting");

    const succeeded = transitionTask(waiting, "succeeded", "Task complete");
    expect(succeeded.status).toBe("succeeded");
    expect(succeeded.events.some((e) => e.type === "task.succeeded")).toBe(true);
  });

  it("should checkpoint a task", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const checkpointed = checkpointTask(task, "Midpoint");

    expect(checkpointed.checkpoints).toHaveLength(1);
    expect(checkpointed.checkpoints[0].note).toBe("Midpoint");
  });

  it("should retry a task", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const retried = retryTask(task, "Try again");

    expect(retried.status).toBe("queued");
    expect(retried.checkpoints).toHaveLength(1);
  });

  it("should cancel a task", () => {
    const task = createRuntimeTask(sampleAgentDefinition, { prompt: "Test" });
    const canceled = cancelTask(task, "No longer needed");

    expect(canceled.status).toBe("canceled");
    expect(canceled.events.some((e) => e.type === "task.canceled")).toBe(true);
  });
});
