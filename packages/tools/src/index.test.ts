import { describe, it, expect, beforeEach } from "vitest";
import {
  createToolDefinition,
  registerTool,
  listEnabledTools,
  resolveTool,
  disableTool,
  enableTool,
  removeTool,
  getToolsByTransport,
  getToolsByScope,
  hasPermission,
  canExecuteTool,
  executeTool,
  ToolExecutionLogger,
  convertToMCPTools,
  createMCPHandler,
  builtinExecutors,
  type ToolRegistryEntry,
  type ToolExecutionContext,
} from "./index";

const sampleTool = createToolDefinition({
  id: "tool_search",
  name: "Search",
  description: "Search the web",
  scope: "workspace",
  transport: "http",
  permissions: ["read"],
  version: "0.1.0",
});

const sampleTool2 = createToolDefinition({
  id: "tool_email",
  name: "Email",
  description: "Send emails",
  scope: "workspace",
  transport: "mcp",
  permissions: ["read", "write"],
  version: "0.1.0",
});

const sampleContext: ToolExecutionContext = {
  agentId: "agent_1",
  taskId: "task_1",
  permissions: ["read", "write"],
};

describe("createToolDefinition", () => {
  it("should return the definition as-is", () => {
    const tool = createToolDefinition(sampleTool);
    expect(tool.id).toBe("tool_search");
    expect(tool.name).toBe("Search");
  });
});

describe("registerTool", () => {
  it("should add a tool to empty registry", () => {
    const registry = registerTool(sampleTool, []);
    expect(registry).toHaveLength(1);
    expect(registry[0].enabled).toBe(true);
    expect(registry[0].registeredAt).toBeDefined();
  });

  it("should replace existing tool with same id", () => {
    const existing = registerTool(sampleTool, []);
    const registry = registerTool(sampleTool, existing);
    expect(registry).toHaveLength(1);
    expect(registry[0].id).toBe("tool_search");
  });

  it("should keep multiple tools with different ids", () => {
    const registry = registerTool(sampleTool, []);
    const registry2 = registerTool(sampleTool2, registry);
    expect(registry2).toHaveLength(2);
  });
});

describe("listEnabledTools", () => {
  it("should return only enabled tools", () => {
    const registry = registerTool(sampleTool, []);
    const disabled = disableTool(registry, "tool_search");

    expect(listEnabledTools(registry)).toHaveLength(1);
    expect(listEnabledTools(disabled)).toHaveLength(0);
  });
});

describe("resolveTool", () => {
  it("should find enabled tool by id", () => {
    const registry = registerTool(sampleTool, []);
    const found = resolveTool(registry, "tool_search");
    expect(found).toBeDefined();
    expect(found?.id).toBe("tool_search");
  });

  it("should return undefined for missing tool", () => {
    const registry = registerTool(sampleTool, []);
    expect(resolveTool(registry, "nonexistent")).toBeUndefined();
  });

  it("should return undefined for disabled tool", () => {
    const registry = disableTool(registerTool(sampleTool, []), "tool_search");
    expect(resolveTool(registry, "tool_search")).toBeUndefined();
  });
});

describe("disableTool / enableTool", () => {
  it("should disable and re-enable a tool", () => {
    let registry = registerTool(sampleTool, []);
    expect(listEnabledTools(registry)).toHaveLength(1);

    registry = disableTool(registry, "tool_search");
    expect(listEnabledTools(registry)).toHaveLength(0);

    registry = enableTool(registry, "tool_search");
    expect(listEnabledTools(registry)).toHaveLength(1);
  });
});

describe("removeTool", () => {
  it("should remove a tool from registry", () => {
    let registry = registerTool(sampleTool, []);
    registry = registerTool(sampleTool2, registry);
    expect(registry).toHaveLength(2);

    registry = removeTool(registry, "tool_search");
    expect(registry).toHaveLength(1);
    expect(registry[0].id).toBe("tool_email");
  });
});

describe("getToolsByTransport", () => {
  it("should filter tools by transport", () => {
    let registry = registerTool(sampleTool, []);
    registry = registerTool(sampleTool2, registry);

    const httpTools = getToolsByTransport(registry, "http");
    expect(httpTools).toHaveLength(1);
    expect(httpTools[0].transport).toBe("http");

    const mcpTools = getToolsByTransport(registry, "mcp");
    expect(mcpTools).toHaveLength(1);
    expect(mcpTools[0].transport).toBe("mcp");
  });
});

describe("getToolsByScope", () => {
  it("should filter tools by scope", () => {
    const globalTool = createToolDefinition({
      ...sampleTool,
      id: "tool_global",
      scope: "global",
    });

    let registry = registerTool(sampleTool, []);
    registry = registerTool(globalTool, registry);

    const workspaceTools = getToolsByScope(registry, "workspace");
    expect(workspaceTools).toHaveLength(1);

    const globalTools = getToolsByScope(registry, "global");
    expect(globalTools).toHaveLength(1);
  });
});

describe("hasPermission", () => {
  it("should check permissions", () => {
    expect(hasPermission(sampleContext, "read")).toBe(true);
    expect(hasPermission(sampleContext, "write")).toBe(true);
    expect(hasPermission(sampleContext, "approve")).toBe(false);
  });
});

describe("canExecuteTool", () => {
  it("should allow execution when permissions match", () => {
    const result = canExecuteTool(sampleContext, registerTool(sampleTool, [])[0]);
    expect(result.allowed).toBe(true);
  });

  it("should deny execution when tool is disabled", () => {
    const disabled = disableTool(registerTool(sampleTool, []), "tool_search")[0];
    const result = canExecuteTool(sampleContext, disabled);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("disabled");
  });

  it("should deny execution when permissions are missing", () => {
    const noWriteContext: ToolExecutionContext = {
      agentId: "agent_1",
      taskId: "task_1",
      permissions: ["read"],
    };

    const tool = registerTool(sampleTool2, [])[0]; // needs read + write
    const result = canExecuteTool(noWriteContext, tool);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("write");
  });
});

describe("executeTool", () => {
  it("should execute with custom executor", async () => {
    const tool = registerTool(sampleTool, [])[0];
    const executor = async () => ({ results: ["test"] });

    const result = await executeTool(tool, { query: "test" }, sampleContext, executor);
    expect(result.ok).toBe(true);
    expect(result.output).toEqual({ results: ["test"] });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();
  });

  it("should return error when permission denied", async () => {
    const tool = registerTool(sampleTool2, [])[0]; // needs write
    const noWriteContext: ToolExecutionContext = {
      agentId: "agent_1",
      taskId: "task_1",
      permissions: ["read"],
    };

    const result = await executeTool(tool, {}, noWriteContext);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("write");
  });

  it("should handle executor errors", async () => {
    const tool = registerTool(sampleTool, [])[0];
    const executor = async () => {
      throw new Error("Execution failed");
    };

    const result = await executeTool(tool, {}, sampleContext, executor);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Execution failed");
  });

  it("should return default output when no executor provided", async () => {
    const tool = registerTool(sampleTool, [])[0];
    const result = await executeTool(tool, {}, sampleContext);
    expect(result.ok).toBe(true);
    expect(result.output).toBeDefined();
  });
});

describe("builtinExecutors", () => {
  it("should have search executor", async () => {
    const result = await builtinExecutors.tool_search(sampleTool, { query: "test" }, sampleContext);
    expect(result).toHaveProperty("results");
  });

  it("should have email executor", async () => {
    const result = await builtinExecutors.tool_email(sampleTool, { to: "test@example.com", subject: "Hello" }, sampleContext);
    expect(result).toHaveProperty("sent", true);
  });

  it("should have billing executor", async () => {
    const result = await builtinExecutors.tool_billing(sampleTool, {}, sampleContext);
    expect(result).toHaveProperty("invoices");
  });

  it("should have approval executor", async () => {
    const result = await builtinExecutors.tool_approval(sampleTool, { action: "refund" }, sampleContext);
    expect(result).toHaveProperty("approved", true);
  });

  it("should have memory executor", async () => {
    const result = await builtinExecutors.tool_memory(sampleTool, { content: "Test memory" }, sampleContext);
    expect(result).toHaveProperty("stored", true);
  });
});

describe("ToolExecutionLogger", () => {
  let logger: ToolExecutionLogger;

  beforeEach(() => {
    logger = new ToolExecutionLogger();
  });

  it("should log executions", () => {
    const entry = logger.log("tool_search", "agent_1", "task_1", { query: "test" }, {
      ok: true,
      toolId: "tool_search",
      output: { results: [] },
      durationMs: 100,
      timestamp: new Date().toISOString(),
    });

    expect(entry.id).toBeDefined();
    expect(entry.toolId).toBe("tool_search");
    expect(logger.getLogs()).toHaveLength(1);
  });

  it("should filter logs by agent", () => {
    logger.log("tool_search", "agent_1", "task_1", {}, { ok: true, toolId: "tool_search", durationMs: 50, timestamp: "" });
    logger.log("tool_search", "agent_2", "task_2", {}, { ok: true, toolId: "tool_search", durationMs: 50, timestamp: "" });

    expect(logger.getLogs({ agentId: "agent_1" })).toHaveLength(1);
    expect(logger.getLogs({ agentId: "agent_2" })).toHaveLength(1);
  });

  it("should compute stats", () => {
    logger.log("tool_search", "agent_1", "task_1", {}, { ok: true, toolId: "tool_search", durationMs: 100, timestamp: "" });
    logger.log("tool_search", "agent_1", "task_1", {}, { ok: false, toolId: "tool_search", durationMs: 200, timestamp: "" });

    const stats = logger.getStats("agent_1");
    expect(stats.totalExecutions).toBe(2);
    expect(stats.successCount).toBe(1);
    expect(stats.failureCount).toBe(1);
    expect(stats.avgDurationMs).toBe(150);
  });

  it("should clear logs", () => {
    logger.log("tool_search", "agent_1", "task_1", {}, { ok: true, toolId: "tool_search", durationMs: 50, timestamp: "" });
    const cleared = logger.clear();
    expect(cleared).toBe(1);
    expect(logger.getLogs()).toHaveLength(0);
  });
});

describe("convertToMCPTools", () => {
  it("should convert MCP tools", () => {
    const registry = registerTool(sampleTool, []);
    const registry2 = registerTool(sampleTool2, registry);

    const mcpTools = convertToMCPTools(registry2);
    expect(mcpTools).toHaveLength(1);
    expect(mcpTools[0].name).toBe("tool_email");
  });
});

describe("createMCPHandler", () => {
  it("should create a handler that executes tools", async () => {
    const registry = registerTool(sampleTool, []);
    const executor = async () => ({ results: [] });

    const handler = createMCPHandler(registry, executor);
    const result = await handler("tool_search", { query: "test" }, sampleContext);

    expect(result.ok).toBe(true);
  });

  it("should throw for unknown tools", async () => {
    const registry = registerTool(sampleTool, []);
    const executor = async () => ({});
    const handler = createMCPHandler(registry, executor);

    await expect(handler("nonexistent", {}, sampleContext)).rejects.toThrow("Tool not found");
  });
});
