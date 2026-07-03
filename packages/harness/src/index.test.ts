import { describe, it, expect } from "vitest";
import {
  createHarnessRequest,
  createHarnessWorkItem,
  generateAgentFromRequest,
  assignHarnessRequest,
} from "./index";

describe("createHarnessRequest", () => {
  it("should create a request with correct fields", () => {
    const request = createHarnessRequest("Find AI jobs", "user-123");

    expect(request.id).toContain("req_");
    expect(request.prompt).toBe("Find AI jobs");
    expect(request.requestedBy).toBe("user-123");
    expect(request.createdAt).toBeDefined();
  });
});

describe("createHarnessWorkItem", () => {
  it("should create a work item from a request", () => {
    const request = createHarnessRequest("Test prompt", "user-1");
    const workItem = createHarnessWorkItem(request);

    expect(workItem.id).toContain("work_");
    expect(workItem.requestId).toBe(request.id);
    expect(workItem.status).toBe("assigned");
    expect(workItem.assignedAgent).toBe("agent-builder");
  });

  it("should use custom agent name", () => {
    const request = createHarnessRequest("Test", "user-1");
    const workItem = createHarnessWorkItem(request, "custom-agent");

    expect(workItem.assignedAgent).toBe("custom-agent");
  });
});

describe("generateAgentFromRequest", () => {
  it("should generate an agent from a request", () => {
    const request = createHarnessRequest("Find AI jobs", "user-1");
    const agent = generateAgentFromRequest(request);

    expect(agent.id).toBeDefined();
    expect(agent.id.length).toBeGreaterThan(0);
    expect(agent.name).toBeDefined();
    expect(agent.description).toBe("Find AI jobs");
    expect(agent.model.provider).toBe("openrouter");
    expect(agent.tools.length).toBeGreaterThan(0);
  });

  it("should use billing tools for billing-related prompts", () => {
    const request = createHarnessRequest("Check my invoice", "user-1");
    const agent = generateAgentFromRequest(request);

    expect(agent.tools.some((t) => t.id === "tool_billing")).toBe(true);
  });

  it("should use approval tools for approval-related prompts", () => {
    const request = createHarnessRequest("Approve this refund", "user-1");
    const agent = generateAgentFromRequest(request);

    expect(agent.tools.some((t) => t.id === "tool_approval")).toBe(true);
  });
});

describe("assignHarnessRequest", () => {
  it("should create a full assignment", () => {
    const assignment = assignHarnessRequest("Find 2026 AI engineer jobs");

    expect(assignment.request).toBeDefined();
    expect(assignment.workItem).toBeDefined();
    expect(assignment.generatedAgent).toBeDefined();
    expect(assignment.task).toBeDefined();
    expect(assignment.run).toBeDefined();

    expect(assignment.generatedAgent.status).toBe("ready");
    expect(assignment.run.status).toBe("succeeded");
    expect(assignment.run.progress).toBe(100);
  });

  it("should include correct task references", () => {
    const assignment = assignHarnessRequest("Test prompt");

    expect(assignment.task.agent.id).toBe(assignment.generatedAgent.id);
    expect(assignment.run.agentId).toBe(assignment.generatedAgent.id);
    expect(assignment.run.taskId).toBe(assignment.task.id);
  });
});
