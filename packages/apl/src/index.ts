export type AgentId = string;
export type ToolId = string;
export type MemoryScope = "session" | "workspace" | "global";

export type AgentStatus = "draft" | "ready" | "running" | "failed" | "paused";
export type AgentProvider = "openrouter";

export type AgentModelConfig = {
  provider: AgentProvider;
  model: string;
  family: "open-source";
};

export type AgentTool = {
  id: ToolId;
  name: string;
  description?: string;
  required: boolean;
};

export type AgentMemory = {
  scope: MemoryScope;
  retentionDays?: number;
  encrypted?: boolean;
};

export type AgentApprovalPolicy = {
  requireHumanApprovalFor: Array<"tool-write" | "tool-approve" | "publish" | "deploy">;
};

export type AgentRunPolicy = {
  checkpointEvery: "step" | "tool" | "memory-change";
  retryLimit: number;
  cancelable: boolean;
  resumable: boolean;
};

export type AgentOutputSchema = {
  type: "json" | "markdown" | "react-component-registry";
  requiredFields: string[];
};

export type AgentDefinition = {
  id: AgentId;
  name: string;
  version: string;
  description: string;
  model: AgentModelConfig;
  tools: AgentTool[];
  memory?: AgentMemory;
  approval?: AgentApprovalPolicy;
  run?: AgentRunPolicy;
  output?: AgentOutputSchema;
  status: AgentStatus;
};

export type ValidationIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult =
  | { valid: true; issues: ValidationIssue[] }
  | { valid: false; issues: ValidationIssue[] };

export function createAgentDefinition(
  definition: Omit<AgentDefinition, "status" | "model"> & {
    model?: AgentModelConfig;
    status?: AgentStatus;
  },
): AgentDefinition {
  return {
    ...definition,
    model: definition.model ?? {
      provider: "openrouter",
      model: "moonshotai/kimi-k2:free",
      family: "open-source",
    },
    approval: definition.approval ?? {
      requireHumanApprovalFor: [],
    },
    run: definition.run ?? {
      checkpointEvery: "tool",
      retryLimit: 3,
      cancelable: true,
      resumable: true,
    },
    output: definition.output ?? {
      type: "json",
      requiredFields: [],
    },
    status: definition.status ?? "draft",
  };
}

export function validateAgentDefinition(
  definition: AgentDefinition,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!definition.id.trim()) {
    issues.push({ path: "id", message: "Agent id is required.", severity: "error" });
  }

  if (!definition.name.trim()) {
    issues.push({ path: "name", message: "Agent name is required.", severity: "error" });
  }

  if (!definition.version.trim()) {
    issues.push({ path: "version", message: "Version is required.", severity: "error" });
  }

  if (!definition.description.trim()) {
    issues.push({
      path: "description",
      message: "Description is required.",
      severity: "warning",
    });
  }

  if (definition.tools.length === 0) {
    issues.push({
      path: "tools",
      message: "At least one tool is recommended.",
      severity: "warning",
    });
  }

  if (!definition.model.model.trim()) {
    issues.push({
      path: "model.model",
      message: "Model slug is required.",
      severity: "error",
    });
  }

  if (definition.run?.retryLimit !== undefined && definition.run.retryLimit < 0) {
    issues.push({
      path: "run.retryLimit",
      message: "Retry limit cannot be negative.",
      severity: "error",
    });
  }

  return issues.some((issue) => issue.severity === "error")
    ? { valid: false, issues }
    : { valid: true, issues };
}
