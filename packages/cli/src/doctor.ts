import type { AgentDefinition } from "@kaidon/apl";

export type DoctorCheck = {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  severity: "error" | "warning" | "info";
};

export type DoctorReport = {
  agent: string;
  checks: DoctorCheck[];
  passed: number;
  warnings: number;
  failures: number;
  score: number;
};

const MAX_PROMPT_SIZE = 10000;
const MIN_RETRY_LIMIT = 1;
const REQUIRED_TOOL_FIELDS: Array<{ field: string; message: string }> = [
  { field: "id", message: "Tool is missing an id" },
  { field: "name", message: "Tool is missing a name" },
];

export function runDoctor(agent: AgentDefinition): DoctorReport {
  const checks: DoctorCheck[] = [];

  checks.push(checkRetryLimit(agent));
  checks.push(checkPromptSize(agent));
  checks.push(checkToolCompleteness(agent));
  checks.push(checkMemoryConfig(agent));
  checks.push(checkOutputSchema(agent));
  checks.push(checkModelConfig(agent));
  checks.push(checkRunPolicy(agent));
  checks.push(checkApprovalPolicy(agent));
  checks.push(checkAgentStatus(agent));
  checks.push(checkDescriptionQuality(agent));

  const passed = checks.filter((c) => c.status === "pass").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const failures = checks.filter((c) => c.status === "fail").length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    agent: agent.id,
    checks,
    passed,
    warnings,
    failures,
    score,
  };
}

function checkRetryLimit(agent: AgentDefinition): DoctorCheck {
  const retryLimit = agent.run?.retryLimit ?? 0;

  if (retryLimit >= MIN_RETRY_LIMIT) {
    return {
      id: "retry-limit",
      name: "Retry limit",
      status: "pass",
      message: `Retry limit set to ${retryLimit}`,
      severity: "info",
    };
  }

  return {
    id: "retry-limit",
    name: "Retry limit",
    status: "fail",
    message: `Retry limit is ${retryLimit}. Agents without retries will fail permanently on the first error.`,
    severity: "error",
  };
}

function checkPromptSize(agent: AgentDefinition): DoctorCheck {
  const descriptionLength = agent.description.length;
  const toolCount = agent.tools.length;
  const estimatedPromptSize = descriptionLength + toolCount * 100;

  if (estimatedPromptSize <= MAX_PROMPT_SIZE) {
    return {
      id: "prompt-size",
      name: "Prompt size",
      status: "pass",
      message: `Estimated prompt size ${estimatedPromptSize} tokens (under ${MAX_PROMPT_SIZE} limit)`,
      severity: "info",
    };
  }

  return {
    id: "prompt-size",
    name: "Prompt size",
    status: "warn",
    message: `Estimated prompt size ${estimatedPromptSize} tokens may exceed context window`,
    severity: "warning",
  };
}

function checkToolCompleteness(agent: AgentDefinition): DoctorCheck {
  if (agent.tools.length === 0) {
    return {
      id: "tool-completeness",
      name: "Tool completeness",
      status: "warn",
      message: "No tools defined. Agent may not be able to perform actions.",
      severity: "warning",
    };
  }

  const missingFields: string[] = [];
  for (const tool of agent.tools) {
    for (const check of REQUIRED_TOOL_FIELDS) {
      if (!(tool as Record<string, unknown>)[check.field]) {
        missingFields.push(`Tool "${tool.name ?? "unknown"}": ${check.message}`);
      }
    }
  }

  if (missingFields.length > 0) {
    return {
      id: "tool-completeness",
      name: "Tool completeness",
      status: "fail",
      message: `Missing tool fields: ${missingFields.join("; ")}`,
      severity: "error",
    };
  }

  return {
    id: "tool-completeness",
    name: "Tool completeness",
    status: "pass",
    message: `${agent.tools.length} tools defined with complete metadata`,
    severity: "info",
  };
}

function checkMemoryConfig(agent: AgentDefinition): DoctorCheck {
  if (!agent.memory) {
    return {
      id: "memory-config",
      name: "Memory configuration",
      status: "warn",
      message: "No memory configuration. Agent will not persist context between runs.",
      severity: "warning",
    };
  }

  const issues: string[] = [];
  if (agent.memory.scope === "global") {
    issues.push("Global memory scope may expose sensitive data across workspaces");
  }
  if (!agent.memory.encrypted && agent.memory.scope !== "session") {
    issues.push("Non-encrypted memory may expose sensitive data");
  }
  if (agent.memory.retentionDays && agent.memory.retentionDays > 90) {
    issues.push(`Retention of ${agent.memory.retentionDays} days may increase storage costs`);
  }

  if (issues.length > 0) {
    return {
      id: "memory-config",
      name: "Memory configuration",
      status: "warn",
      message: issues.join("; "),
      severity: "warning",
    };
  }

  return {
    id: "memory-config",
    name: "Memory configuration",
    status: "pass",
    message: `Memory configured with ${agent.memory.scope} scope`,
    severity: "info",
  };
}

function checkOutputSchema(agent: AgentDefinition): DoctorCheck {
  if (!agent.output) {
    return {
      id: "output-schema",
      name: "Output schema",
      status: "warn",
      message: "No output schema defined. Agent output will not be validated.",
      severity: "warning",
    };
  }

  if (agent.output.requiredFields.length === 0) {
    return {
      id: "output-schema",
      name: "Output schema",
      status: "warn",
      message: "Output schema has no required fields. Consider defining expected output structure.",
      severity: "warning",
    };
  }

  return {
    id: "output-schema",
    name: "Output schema",
    status: "pass",
    message: `Output schema requires ${agent.output.requiredFields.length} fields: ${agent.output.requiredFields.join(", ")}`,
    severity: "info",
  };
}

function checkModelConfig(agent: AgentDefinition): DoctorCheck {
  if (!agent.model) {
    return {
      id: "model-config",
      name: "Model configuration",
      status: "fail",
      message: "No model configuration. Agent cannot run without a model.",
      severity: "error",
    };
  }

  if (!agent.model.model) {
    return {
      id: "model-config",
      name: "Model configuration",
      status: "fail",
      message: "Model slug is empty. Agent cannot run without a model.",
      severity: "error",
    };
  }

  if (agent.model.family !== "open-source") {
    return {
      id: "model-config",
      name: "Model configuration",
      status: "warn",
      message: `Model family "${agent.model.family}" is not open-source. Consider using open-source models for cost efficiency.`,
      severity: "warning",
    };
  }

  return {
    id: "model-config",
    name: "Model configuration",
    status: "pass",
    message: `Model configured: ${agent.model.model} (${agent.model.family})`,
    severity: "info",
  };
}

function checkRunPolicy(agent: AgentDefinition): DoctorCheck {
  if (!agent.run) {
    return {
      id: "run-policy",
      name: "Run policy",
      status: "warn",
      message: "No run policy defined. Using defaults.",
      severity: "warning",
    };
  }

  const issues: string[] = [];
  if (!agent.run.resumable) {
    issues.push("Agent is not resumable. Interrupted runs will need to restart from scratch.");
  }
  if (!agent.run.cancelable) {
    issues.push("Agent is not cancelable. Users cannot stop running agents.");
  }

  if (issues.length > 0) {
    return {
      id: "run-policy",
      name: "Run policy",
      status: "warn",
      message: issues.join("; "),
      severity: "warning",
    };
  }

  return {
    id: "run-policy",
    name: "Run policy",
    status: "pass",
    message: `Run policy: checkpoint every ${agent.run.checkpointEvery}, resumable: ${agent.run.resumable}`,
    severity: "info",
  };
}

function checkApprovalPolicy(agent: AgentDefinition): DoctorCheck {
  if (!agent.approval) {
    return {
      id: "approval-policy",
      name: "Approval policy",
      status: "pass",
      message: "No approval policy. Agent runs autonomously.",
      severity: "info",
    };
  }

  const approvalCount = agent.approval.requireHumanApprovalFor.length;
  if (approvalCount === 0) {
    return {
      id: "approval-policy",
      name: "Approval policy",
      status: "pass",
      message: "Approval policy defined but requires no approvals.",
      severity: "info",
    };
  }

  return {
    id: "approval-policy",
    name: "Approval policy",
    status: "pass",
    message: `Requires human approval for: ${agent.approval.requireHumanApprovalFor.join(", ")}`,
    severity: "info",
  };
}

function checkAgentStatus(agent: AgentDefinition): DoctorCheck {
  if (agent.status === "draft") {
    return {
      id: "agent-status",
      name: "Agent status",
      status: "warn",
      message: "Agent is in draft status. It may not be ready for production use.",
      severity: "warning",
    };
  }

  if (agent.status === "failed") {
    return {
      id: "agent-status",
      name: "Agent status",
      status: "fail",
      message: "Agent is in failed status. It cannot run.",
      severity: "error",
    };
  }

  return {
    id: "agent-status",
    name: "Agent status",
    status: "pass",
    message: `Agent status: ${agent.status}`,
    severity: "info",
  };
}

function checkDescriptionQuality(agent: AgentDefinition): DoctorCheck {
  if (!agent.description || agent.description.length < 10) {
    return {
      id: "description-quality",
      name: "Description quality",
      status: "warn",
      message: "Description is too short. A detailed description helps with agent selection and debugging.",
      severity: "warning",
    };
  }

  if (agent.description.length > 500) {
    return {
      id: "description-quality",
      name: "Description quality",
      status: "warn",
      message: "Description is very long. Consider keeping it concise for better readability.",
      severity: "warning",
    };
  }

  return {
    id: "description-quality",
    name: "Description quality",
    status: "pass",
    message: `Description is ${agent.description.length} characters`,
    severity: "info",
  };
}
