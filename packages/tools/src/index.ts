import type { ToolId } from "@kaidon/apl";

// ─── Types ───────────────────────────────────────────────

export type ToolScope = "local" | "workspace" | "global";
export type ToolTransport = "mcp" | "http" | "cli" | "builtin";
export type ToolPermission = "read" | "write" | "approve";

export type ToolDefinition = {
  id: ToolId;
  name: string;
  description: string;
  scope: ToolScope;
  transport: ToolTransport;
  permissions: ToolPermission[];
  version: string;
  endpoint?: string;
  schema?: ToolSchema;
};

export type ToolSchema = {
  input?: Record<string, ToolSchemaField>;
  output?: Record<string, ToolSchemaField>;
};

export type ToolSchemaField = {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  default?: unknown;
};

export type ToolRegistryEntry = ToolDefinition & {
  registeredAt: string;
  enabled: boolean;
};

export type ToolExecutionContext = {
  agentId: string;
  taskId: string;
  userId?: string;
  permissions: ToolPermission[];
};

export type ToolExecutionResult = {
  ok: boolean;
  toolId: string;
  output?: unknown;
  error?: string;
  durationMs: number;
  timestamp: string;
};

export type ToolExecutionLog = {
  id: string;
  toolId: string;
  agentId: string;
  taskId: string;
  input: unknown;
  result: ToolExecutionResult;
  executedAt: string;
};

// ─── Factory Functions ───────────────────────────────────

export function createToolDefinition(definition: ToolDefinition): ToolDefinition {
  return definition;
}

// ─── Registry Functions ──────────────────────────────────

export function registerTool(
  definition: ToolDefinition,
  registry: ToolRegistryEntry[] = [],
): ToolRegistryEntry[] {
  const entry: ToolRegistryEntry = {
    ...definition,
    registeredAt: new Date().toISOString(),
    enabled: true,
  };

  return [...registry.filter((item) => item.id !== definition.id), entry];
}

export function listEnabledTools(registry: ToolRegistryEntry[]): ToolRegistryEntry[] {
  return registry.filter((tool) => tool.enabled);
}

export function resolveTool(
  registry: ToolRegistryEntry[],
  toolId: ToolId,
): ToolRegistryEntry | undefined {
  return registry.find((tool) => tool.id === toolId && tool.enabled);
}

export function disableTool(registry: ToolRegistryEntry[], toolId: ToolId): ToolRegistryEntry[] {
  return registry.map((tool) =>
    tool.id === toolId ? { ...tool, enabled: false } : tool,
  );
}

export function enableTool(registry: ToolRegistryEntry[], toolId: ToolId): ToolRegistryEntry[] {
  return registry.map((tool) =>
    tool.id === toolId ? { ...tool, enabled: true } : tool,
  );
}

export function removeTool(registry: ToolRegistryEntry[], toolId: ToolId): ToolRegistryEntry[] {
  return registry.filter((tool) => tool.id !== toolId);
}

export function getToolsByTransport(
  registry: ToolRegistryEntry[],
  transport: ToolTransport,
): ToolRegistryEntry[] {
  return registry.filter((tool) => tool.transport === transport && tool.enabled);
}

export function getToolsByScope(
  registry: ToolRegistryEntry[],
  scope: ToolScope,
): ToolRegistryEntry[] {
  return registry.filter((tool) => tool.scope === scope && tool.enabled);
}

// ─── Permission Checking ─────────────────────────────────

export function hasPermission(
  context: ToolExecutionContext,
  permission: ToolPermission,
): boolean {
  return context.permissions.includes(permission);
}

export function canExecuteTool(
  context: ToolExecutionContext,
  tool: ToolRegistryEntry,
): { allowed: boolean; reason?: string } {
  if (!tool.enabled) {
    return { allowed: false, reason: "Tool is disabled" };
  }

  for (const required of tool.permissions) {
    if (!context.permissions.includes(required)) {
      return {
        allowed: false,
        reason: `Missing required permission: ${required}`,
      };
    }
  }

  return { allowed: true };
}

// ─── Tool Execution ──────────────────────────────────────

let executionIdCounter = 0;

export async function executeTool(
  tool: ToolRegistryEntry,
  input: unknown,
  context: ToolExecutionContext,
  executor?: ToolExecutor,
): Promise<ToolExecutionResult> {
  const startTime = Date.now();
  const toolId = tool.id;

  const permissionCheck = canExecuteTool(context, tool);
  if (!permissionCheck.allowed) {
    return {
      ok: false,
      toolId,
      error: permissionCheck.reason ?? "Permission denied",
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  if (executor) {
    try {
      const output = await executor(tool, input, context);
      return {
        ok: true,
        toolId,
        output,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ok: false,
        toolId,
        error: error instanceof Error ? error.message : "Tool execution failed",
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return {
    ok: true,
    toolId,
    output: { message: `Tool ${tool.name} executed (no executor provided)` },
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

export type ToolExecutor = (
  tool: ToolRegistryEntry,
  input: unknown,
  context: ToolExecutionContext,
) => Promise<unknown>;

// ─── Built-in Tool Executors ─────────────────────────────

export const builtinExecutors: Record<string, ToolExecutor> = {
  tool_search: async (tool, input) => {
    const query = typeof input === "object" && input !== null && "query" in input
      ? String((input as Record<string, unknown>).query)
      : String(input);

    return {
      results: [
        { title: `Search result for: ${query}`, url: "https://example.com", snippet: "Sample result" },
      ],
      query,
      source: "builtin-search",
    };
  },

  tool_email: async (tool, input) => {
    const to = typeof input === "object" && input !== null && "to" in input
      ? String((input as Record<string, unknown>).to)
      : "unknown";
    const subject = typeof input === "object" && input !== null && "subject" in input
      ? String((input as Record<string, unknown>).subject)
      : "No subject";

    return {
      sent: true,
      to,
      subject,
      timestamp: new Date().toISOString(),
    };
  },

  tool_billing: async (tool, input) => {
    return {
      invoices: [
        { id: "inv_001", amount: 99.00, status: "paid", date: "2026-01-15" },
        { id: "inv_002", amount: 149.00, status: "pending", date: "2026-02-15" },
      ],
      totalOutstanding: 149.00,
    };
  },

  tool_approval: async (tool, input) => {
    const action = typeof input === "object" && input !== null && "action" in input
      ? String((input as Record<string, unknown>).action)
      : "unknown";

    return {
      approved: true,
      action,
      approvedBy: "system",
      timestamp: new Date().toISOString(),
    };
  },

  tool_memory: async (tool, input) => {
    const content = typeof input === "object" && input !== null && "content" in input
      ? String((input as Record<string, unknown>).content)
      : String(input);

    return {
      stored: true,
      itemId: `mem_${Date.now()}`,
      content,
      scope: "workspace",
    };
  },
};

// ─── Tool Execution Log ──────────────────────────────────

export class ToolExecutionLogger {
  private logs: ToolExecutionLog[] = [];

  log(
    toolId: string,
    agentId: string,
    taskId: string,
    input: unknown,
    result: ToolExecutionResult,
  ): ToolExecutionLog {
    const entry: ToolExecutionLog = {
      id: `exec_${++executionIdCounter}_${Date.now()}`,
      toolId,
      agentId,
      taskId,
      input,
      result,
      executedAt: new Date().toISOString(),
    };

    this.logs.push(entry);
    return entry;
  }

  getLogs(options: { agentId?: string; taskId?: string; toolId?: string } = {}): ToolExecutionLog[] {
    let filtered = [...this.logs];

    if (options.agentId) {
      filtered = filtered.filter((l) => l.agentId === options.agentId);
    }
    if (options.taskId) {
      filtered = filtered.filter((l) => l.taskId === options.taskId);
    }
    if (options.toolId) {
      filtered = filtered.filter((l) => l.toolId === options.toolId);
    }

    return filtered;
  }

  getStats(agentId?: string): { totalExecutions: number; successCount: number; failureCount: number; avgDurationMs: number } {
    const logs = agentId ? this.logs.filter((l) => l.agentId === agentId) : this.logs;
    const successCount = logs.filter((l) => l.result.ok).length;
    const totalDuration = logs.reduce((sum, l) => sum + l.result.durationMs, 0);

    return {
      totalExecutions: logs.length,
      successCount,
      failureCount: logs.length - successCount,
      avgDurationMs: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
    };
  }

  clear(): number {
    const count = this.logs.length;
    this.logs = [];
    return count;
  }
}

// ─── MCP Adapter ─────────────────────────────────────────

export type MCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export function convertToMCPTools(registry: ToolRegistryEntry[]): MCPTool[] {
  return registry
    .filter((tool) => tool.transport === "mcp" && tool.enabled)
    .map((tool) => ({
      name: tool.id,
      description: tool.description,
      inputSchema: tool.schema?.input ?? {},
    }));
}

export function createMCPHandler(
  registry: ToolRegistryEntry[],
  executor: ToolExecutor,
) {
  return async (toolName: string, input: unknown, context: ToolExecutionContext) => {
    const tool = resolveTool(registry, toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return executeTool(tool, input, context, executor);
  };
}
