import { createAgentDefinition, validateAgentDefinition, type AgentDefinition } from "./index";

export const sampleAgentDefinition = createAgentDefinition({
  id: "sample-research-agent",
  name: "Sample Research Agent",
  version: "0.1.0",
  description: "Research and summarize job market results.",
  tools: [
    {
      id: "tool_search",
      name: "Search",
      required: true,
    },
    {
      id: "tool_notes",
      name: "Notes",
      required: true,
    },
  ],
  memory: {
    scope: "workspace",
    retentionDays: 30,
    encrypted: true,
  },
  approval: {
    requireHumanApprovalFor: ["deploy"],
  },
  run: {
    checkpointEvery: "tool",
    retryLimit: 3,
    cancelable: true,
    resumable: true,
  },
  output: {
    type: "json",
    requiredFields: ["roles", "sources"],
  },
  status: "ready",
});

export const sampleAgentValidation = validateAgentDefinition(sampleAgentDefinition);

export const sampleAgentDefinitionContract: AgentDefinition = sampleAgentDefinition;
