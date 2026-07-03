export type MemoryScope = "session" | "workspace" | "global";

export type MemoryItem = {
  id: string;
  scope: MemoryScope;
  content: string;
  source: string;
  createdAt: string;
};

export type MemoryPolicy = {
  scope: MemoryScope;
  retentionDays: number;
  encrypted: boolean;
  allowRetrieval: boolean;
};

export type ContextBudget = {
  maxTokens: number;
  reservedTokens: number;
  compressionEnabled: boolean;
};

export type ContextSnapshot = {
  agentId: string;
  summary: string;
  items: MemoryItem[];
  budget: ContextBudget;
  policy: MemoryPolicy;
};

export function createMemoryItem(item: Omit<MemoryItem, "createdAt">): MemoryItem {
  return {
    ...item,
    createdAt: new Date().toISOString(),
  };
}

export function createMemoryPolicy(policy: MemoryPolicy): MemoryPolicy {
  return policy;
}

export function createContextSnapshot(snapshot: ContextSnapshot): ContextSnapshot {
  return snapshot;
}

export function countVisibleContextTokens(snapshot: ContextSnapshot): number {
  return snapshot.budget.maxTokens - snapshot.budget.reservedTokens;
}
