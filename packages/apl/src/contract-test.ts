import {
  sampleAgentDefinition,
  sampleAgentDefinitionContract,
  sampleAgentValidation,
} from "./fixtures";

if (sampleAgentDefinition.id !== "sample-research-agent") {
  throw new Error("Sample agent id mismatch.");
}

if (sampleAgentDefinitionContract.output?.type !== "json") {
  throw new Error("Sample agent output contract mismatch.");
}

if (!sampleAgentValidation.valid) {
  throw new Error("Sample agent validation failed.");
}

if (sampleAgentValidation.issues.length !== 0) {
  throw new Error("Sample agent validation should not report issues.");
}
