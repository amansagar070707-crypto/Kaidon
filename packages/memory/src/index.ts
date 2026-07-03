// ─── Conditional Crypto (Node.js only) ──────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedNodeCrypto: any = null;
let cryptoResolved = false;

function getNodeCrypto(): { randomBytes: (size: number) => Buffer; createHash: (algo: string) => { update: (data: string) => { digest: () => Buffer } } } | null {
  if (cryptoResolved) return cachedNodeCrypto;
  cryptoResolved = true;

  try {
    // Use eval to hide from webpack static analysis
    // eslint-disable-next-line no-eval
    cachedNodeCrypto = eval("require")("node:crypto");
    return cachedNodeCrypto;
  } catch {
    return null;
  }
}

// ─── Types ───────────────────────────────────────────────

export type MemoryScope = "session" | "workspace" | "global";

export type MemoryItem = {
  id: string;
  scope: MemoryScope;
  content: string;
  source: string;
  createdAt: string;
  updatedAt?: string;
  tokens?: number;
  tags?: string[];
  encrypted?: boolean;
  ttl?: number;
};

export type MemoryPolicy = {
  scope: MemoryScope;
  retentionDays: number;
  encrypted: boolean;
  allowRetrieval: boolean;
  maxItems?: number;
  compressAfterDays?: number;
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

export type MemorySearchResult = {
  item: MemoryItem;
  score: number;
  matchType: "exact" | "partial" | "tag";
};

export type MemoryStats = {
  totalItems: number;
  totalTokens: number;
  scopeCounts: Record<MemoryScope, number>;
  oldestItem?: string;
  newestItem?: string;
};

// ─── Factory Functions ───────────────────────────────────

export function createMemoryItem(item: Omit<MemoryItem, "createdAt" | "tokens">): MemoryItem {
  const content = item.content;
  const estimatedTokens = Math.ceil(content.length / 4);

  return {
    ...item,
    createdAt: new Date().toISOString(),
    tokens: estimatedTokens,
  };
}

export function createMemoryPolicy(policy: MemoryPolicy): MemoryPolicy {
  return {
    maxItems: 1000,
    compressAfterDays: 7,
    ...policy,
  };
}

export function createContextSnapshot(snapshot: ContextSnapshot): ContextSnapshot {
  return snapshot;
}

export function countVisibleContextTokens(snapshot: ContextSnapshot): number {
  const itemTokens = snapshot.items.reduce((sum, item) => sum + (item.tokens ?? 0), 0);
  const available = snapshot.budget.maxTokens - snapshot.budget.reservedTokens;
  return Math.max(0, available - itemTokens);
}

// ─── Memory Store ────────────────────────────────────────

export class MemoryStore {
  private items: MemoryItem[] = [];
  private policy: MemoryPolicy;
  private encryptionKey?: string;

  constructor(policy: MemoryPolicy, encryptionKey?: string) {
    this.policy = createMemoryPolicy(policy);
    this.encryptionKey = encryptionKey;
  }

  add(item: Omit<MemoryItem, "createdAt" | "tokens">): MemoryItem {
    const memoryItem = createMemoryItem(item);

    if (this.policy.encrypted && this.encryptionKey) {
      memoryItem.content = encrypt(memoryItem.content, this.encryptionKey);
      memoryItem.encrypted = true;
    }

    this.items.push(memoryItem);
    this.enforceRetentionPolicy();
    return memoryItem;
  }

  get(id: string): MemoryItem | undefined {
    const item = this.items.find((i) => i.id === id);
    if (!item) return undefined;

    if (item.encrypted && this.encryptionKey) {
      return {
        ...item,
        content: decrypt(item.content, this.encryptionKey),
      };
    }

    return item;
  }

  getAll(scope?: MemoryScope): MemoryItem[] {
    let filtered = scope ? this.items.filter((i) => i.scope === scope) : [...this.items];

    return filtered.map((item) => {
      if (item.encrypted && this.encryptionKey) {
        return {
          ...item,
          content: decrypt(item.content, this.encryptionKey),
        };
      }
      return item;
    });
  }

  search(query: string, options: { scope?: MemoryScope; limit?: number } = {}): MemorySearchResult[] {
    const { scope, limit = 10 } = options;
    const queryLower = query.toLowerCase();
    const queryTokens = tokenize(queryLower);

    let candidates = scope ? this.items.filter((i) => i.scope === scope) : this.items;

    const results: MemorySearchResult[] = [];

    for (const item of candidates) {
      let content = item.content;
      if (item.encrypted && this.encryptionKey) {
        content = decrypt(content, this.encryptionKey);
      }

      const contentLower = content.toLowerCase();
      const contentTokens = tokenize(contentLower);

      let score = 0;
      let matchType: MemorySearchResult["matchType"] = "partial";

      if (contentLower.includes(queryLower)) {
        score = 1.0;
        matchType = "exact";
      } else {
        const overlap = queryTokens.filter((t) => contentTokens.includes(t)).length;
        score = queryTokens.length > 0 ? overlap / queryTokens.length : 0;
      }

      if (item.tags) {
        const tagMatch = item.tags.some((tag) => queryLower.includes(tag.toLowerCase()));
        if (tagMatch) {
          score = Math.max(score, 0.8);
          matchType = "tag";
        }
      }

      if (score > 0) {
        results.push({ item, score, matchType });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  update(id: string, updates: Partial<Pick<MemoryItem, "content" | "tags">>): MemoryItem | undefined {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const item = this.items[index];
    const updated: MemoryItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.content && this.policy.encrypted && this.encryptionKey) {
      updated.content = encrypt(updates.content, this.encryptionKey);
      updated.encrypted = true;
      updated.tokens = Math.ceil(updates.content.length / 4);
    }

    this.items[index] = updated;
    return this.get(id);
  }

  delete(id: string): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  clear(scope?: MemoryScope): number {
    const before = this.items.length;
    if (scope) {
      this.items = this.items.filter((i) => i.scope !== scope);
    } else {
      this.items = [];
    }
    return before - this.items.length;
  }

  getStats(): MemoryStats {
    const scopeCounts: Record<MemoryScope, number> = { session: 0, workspace: 0, global: 0 };
    let totalTokens = 0;
    let oldest: string | undefined;
    let newest: string | undefined;

    for (const item of this.items) {
      scopeCounts[item.scope]++;
      totalTokens += item.tokens ?? 0;

      if (!oldest || item.createdAt < oldest) oldest = item.createdAt;
      if (!newest || item.createdAt > newest) newest = item.createdAt;
    }

    return {
      totalItems: this.items.length,
      totalTokens,
      scopeCounts,
      oldestItem: oldest,
      newestItem: newest,
    };
  }

  buildContext(agentId: string, maxTokens?: number): ContextSnapshot {
    const budget: ContextBudget = {
      maxTokens: maxTokens ?? this.policy.maxItems ?? 8192,
      reservedTokens: 1024,
      compressionEnabled: true,
    };

    const sortedItems = [...this.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    let tokenBudget = budget.maxTokens - budget.reservedTokens;
    const selectedItems: MemoryItem[] = [];

    for (const item of sortedItems) {
      const itemTokens = item.tokens ?? 0;
      if (itemTokens <= tokenBudget) {
        selectedItems.unshift(item);
        tokenBudget -= itemTokens;
      }
    }

    const summary = selectedItems.length > 0
      ? `${selectedItems.length} memory items (${selectedItems.reduce((s, i) => s + (i.tokens ?? 0), 0)} tokens)`
      : "No memory items stored.";

    return {
      agentId,
      summary,
      items: selectedItems,
      budget,
      policy: this.policy,
    };
  }

  private enforceRetentionPolicy(): void {
    if (this.policy.maxItems && this.items.length > this.policy.maxItems) {
      this.items = this.items.slice(-this.policy.maxItems);
    }

    if (this.policy.retentionDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.policy.retentionDays);
      const cutoffStr = cutoff.toISOString();
      this.items = this.items.filter((i) => i.createdAt >= cutoffStr);
    }
  }
}

// ─── Context Builder ─────────────────────────────────────

export function buildContextFromItems(
  items: MemoryItem[],
  budget: ContextBudget,
): { selectedItems: MemoryItem[]; totalTokens: number; droppedCount: number } {
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let tokenBudget = budget.maxTokens - budget.reservedTokens;
  const selectedItems: MemoryItem[] = [];
  let droppedCount = 0;

  for (const item of sortedItems) {
    const itemTokens = item.tokens ?? 0;
    if (itemTokens <= tokenBudget) {
      selectedItems.unshift(item);
      tokenBudget -= itemTokens;
    } else {
      droppedCount++;
    }
  }

  return {
    selectedItems,
    totalTokens: budget.maxTokens - budget.reservedTokens - tokenBudget,
    droppedCount,
  };
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function compressItems(items: MemoryItem[]): MemoryItem[] {
  if (items.length <= 3) return items;

  const recent = items.slice(-3);
  const older = items.slice(0, -3);

  const combinedContent = older
    .map((i) => i.content)
    .join("; ")
    .slice(0, 500);

  const compressed: MemoryItem = {
    id: `compressed_${Date.now()}`,
    scope: older[0]?.scope ?? "workspace",
    content: `[Compressed summary of ${older.length} items] ${combinedContent}`,
    source: "memory-compression",
    createdAt: new Date().toISOString(),
    tokens: Math.ceil(combinedContent.length / 4),
    tags: ["compressed"],
  };

  return [compressed, ...recent];
}

// ─── Encryption Helpers ──────────────────────────────────

export function encrypt(text: string, key: string): string {
  const nodeCrypto = getNodeCrypto();

  if (!nodeCrypto) {
    // Browser fallback: simple XOR without crypto
    const keyBytes = new TextEncoder().encode(key);
    const textBytes = new TextEncoder().encode(text);
    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return Array.from(encrypted).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const iv = nodeCrypto.randomBytes(16);
  const keyHash = nodeCrypto.createHash("sha256").update(key).digest();
  const encrypted = Buffer.alloc(text.length);

  for (let i = 0; i < text.length; i++) {
    encrypted[i] = text.charCodeAt(i) ^ keyHash[i % keyHash.length] ^ iv[i % iv.length];
  }

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string, key: string): string {
  const nodeCrypto = getNodeCrypto();

  if (!nodeCrypto) {
    // Browser fallback: simple XOR without crypto
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = new Uint8Array(
      encryptedText.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? [],
    );
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(decrypted);
  }

  const [ivHex, dataHex] = encryptedText.split(":");
  if (!ivHex || !dataHex) return encryptedText;

  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const keyHash = nodeCrypto.createHash("sha256").update(key).digest();
  const decrypted = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i++) {
    decrypted[i] = data[i] ^ keyHash[i % keyHash.length] ^ iv[i % iv.length];
  }

  return decrypted.toString("utf8");
}

// ─── Helpers ─────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}
