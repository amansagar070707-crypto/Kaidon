import { describe, it, expect } from "vitest";
import {
  createAgentDefinition,
  validateAgentDefinition,
  type AgentDefinition,
} from "./index";
import { sampleAgentDefinition, sampleAgentValidation } from "./fixtures";

describe("createAgentDefinition", () => {
  it("should create an agent with default values", () => {
    const agent = createAgentDefinition({
      id: "test-agent",
      name: "Test Agent",
      version: "1.0.0",
      description: "A test agent",
      tools: [],
    });

    expect(agent.id).toBe("test-agent");
    expect(agent.name).toBe("Test Agent");
    expect(agent.model.provider).toBe("openrouter");
    expect(agent.model.model).toBe("moonshotai/kimi-k2:free");
    expect(agent.model.family).toBe("open-source");
    expect(agent.status).toBe("draft");
    expect(agent.approval!.requireHumanApprovalFor).toEqual([]);
    expect(agent.run!.checkpointEvery).toBe("tool");
    expect(agent.run!.retryLimit).toBe(3);
    expect(agent.output!.type).toBe("json");
  });

  it("should use custom values when provided", () => {
    const agent = createAgentDefinition({
      id: "custom-agent",
      name: "Custom Agent",
      version: "2.0.0",
      description: "Custom description",
      tools: [{ id: "tool1", name: "Tool 1", required: true }],
      model: {
        provider: "openrouter",
        model: "custom/model",
        family: "open-source",
      },
      status: "ready",
      run: {
        checkpointEvery: "step",
        retryLimit: 5,
        cancelable: false,
        resumable: false,
      },
    });

    expect(agent.model.model).toBe("custom/model");
    expect(agent.status).toBe("ready");
    expect(agent.run!.checkpointEvery).toBe("step");
    expect(agent.run!.retryLimit).toBe(5);
  });
});

describe("validateAgentDefinition", () => {
  it("should validate a correct agent definition", () => {
    const result = validateAgentDefinition(sampleAgentDefinition);
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("should report error for empty id", () => {
    const agent = createAgentDefinition({
      id: "",
      name: "Test",
      version: "1.0.0",
      description: "Test",
      tools: [],
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "id" && i.severity === "error")).toBe(true);
  });

  it("should report error for empty name", () => {
    const agent = createAgentDefinition({
      id: "test",
      name: "",
      version: "1.0.0",
      description: "Test",
      tools: [],
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "name")).toBe(true);
  });

  it("should report warning for empty description", () => {
    const agent = createAgentDefinition({
      id: "test",
      name: "Test",
      version: "1.0.0",
      description: "",
      tools: [],
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(true);
    expect(result.issues.some((i) => i.path === "description" && i.severity === "warning")).toBe(true);
  });

  it("should report warning for no tools", () => {
    const agent = createAgentDefinition({
      id: "test",
      name: "Test",
      version: "1.0.0",
      description: "Test",
      tools: [],
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(true);
    expect(result.issues.some((i) => i.path === "tools" && i.severity === "warning")).toBe(true);
  });

  it("should report error for empty model slug", () => {
    const agent = createAgentDefinition({
      id: "test",
      name: "Test",
      version: "1.0.0",
      description: "Test",
      tools: [],
      model: { provider: "openrouter", model: "", family: "open-source" },
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "model.model")).toBe(true);
  });

  it("should report error for negative retry limit", () => {
    const agent = createAgentDefinition({
      id: "test",
      name: "Test",
      version: "1.0.0",
      description: "Test",
      tools: [],
      run: {
        checkpointEvery: "tool",
        retryLimit: -1,
        cancelable: true,
        resumable: true,
      },
    });
    const result = validateAgentDefinition(agent);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "run.retryLimit")).toBe(true);
  });
});

describe("sampleAgentDefinition", () => {
  it("should have correct id", () => {
    expect(sampleAgentDefinition.id).toBe("sample-research-agent");
  });

  it("should have valid output contract", () => {
    expect(sampleAgentDefinition.output?.type).toBe("json");
  });

  it("should be valid", () => {
    expect(sampleAgentValidation.valid).toBe(true);
  });
});
