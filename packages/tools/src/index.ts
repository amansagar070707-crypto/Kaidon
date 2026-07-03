import type { ToolId } from "@kaidon/apl";

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
};

export type ToolRegistryEntry = ToolDefinition & {
  registeredAt: string;
  enabled: boolean;
};

export function createToolDefinition(definition: ToolDefinition): ToolDefinition {
  return definition;
}

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
