import { describe, it, expect, beforeEach } from "vitest";
import {
  MemoryStore,
  createMemoryItem,
  createMemoryPolicy,
  createContextSnapshot,
  countVisibleContextTokens,
  buildContextFromItems,
  estimateTokenCount,
  compressItems,
  encrypt,
  decrypt,
  type MemoryItem,
} from "./index";

describe("createMemoryItem", () => {
  it("should create an item with timestamp and token estimate", () => {
    const item = createMemoryItem({
      id: "mem_1",
      scope: "workspace",
      content: "Hello world test content",
      source: "test",
    });

    expect(item.id).toBe("mem_1");
    expect(item.scope).toBe("workspace");
    expect(item.content).toBe("Hello world test content");
    expect(item.createdAt).toBeDefined();
    expect(item.tokens).toBe(6);
  });

  it("should estimate tokens based on content length", () => {
    const short = createMemoryItem({ id: "a", scope: "session", content: "Hi", source: "t" });
    const long = createMemoryItem({ id: "b", scope: "session", content: "A".repeat(100), source: "t" });

    expect(short.tokens).toBe(1);
    expect(long.tokens).toBe(25);
  });
});

describe("createMemoryPolicy", () => {
  it("should apply defaults", () => {
    const policy = createMemoryPolicy({
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
      allowRetrieval: true,
    });

    expect(policy.maxItems).toBe(1000);
    expect(policy.compressAfterDays).toBe(7);
  });
});

describe("countVisibleContextTokens", () => {
  it("should calculate available tokens", () => {
    const snapshot = createContextSnapshot({
      agentId: "agent_1",
      summary: "test",
      items: [
        createMemoryItem({ id: "m1", scope: "workspace", content: "A".repeat(40), source: "t" }),
        createMemoryItem({ id: "m2", scope: "workspace", content: "B".repeat(80), source: "t" }),
      ],
      budget: { maxTokens: 1000, reservedTokens: 100, compressionEnabled: true },
      policy: createMemoryPolicy({ scope: "workspace", retentionDays: 30, encrypted: false, allowRetrieval: true }),
    });

    const visible = countVisibleContextTokens(snapshot);
    expect(visible).toBe(870);
  });
});

describe("estimateTokenCount", () => {
  it("should estimate tokens as ceil(length/4)", () => {
    expect(estimateTokenCount("")).toBe(0);
    expect(estimateTokenCount("ab")).toBe(1);
    expect(estimateTokenCount("abcdefgh")).toBe(2);
  });
});

describe("encrypt/decrypt", () => {
  it("should encrypt and decrypt text", () => {
    const original = "Sensitive memory content here";
    const key = "test-secret-key";

    const encrypted = encrypt(original, key);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(":");

    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe(original);
  });

  it("should return original text if format is invalid", () => {
    expect(decrypt("no-colon", "key")).toBe("no-colon");
  });

  it("should produce different ciphertext for same plaintext", () => {
    const enc1 = encrypt("same", "key");
    const enc2 = encrypt("same", "key");
    expect(enc1).not.toBe(enc2);
  });
});

describe("MemoryStore", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore(
      createMemoryPolicy({ scope: "workspace", retentionDays: 365, encrypted: false, allowRetrieval: true }),
    );
  });

  it("should add and retrieve items", () => {
    store.add({ id: "m1", scope: "workspace", content: "Test content", source: "test" });
    const item = store.get("m1");

    expect(item).toBeDefined();
    expect(item?.content).toBe("Test content");
  });

  it("should return undefined for missing items", () => {
    expect(store.get("nonexistent")).toBeUndefined();
  });

  it("should get all items", () => {
    store.add({ id: "m1", scope: "workspace", content: "A", source: "t" });
    store.add({ id: "m2", scope: "session", content: "B", source: "t" });

    expect(store.getAll()).toHaveLength(2);
    expect(store.getAll("workspace")).toHaveLength(1);
    expect(store.getAll("session")).toHaveLength(1);
  });

  it("should search items by content", () => {
    store.add({ id: "m1", scope: "workspace", content: "Billing lookup allowed", source: "t" });
    store.add({ id: "m2", scope: "workspace", content: "Customer support ticket", source: "t" });
    store.add({ id: "m3", scope: "workspace", content: "Invoice correction needed", source: "t" });

    const results = store.search("billing");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe("m1");
    expect(results[0].matchType).toBe("exact");
  });

  it("should search by tags", () => {
    store.add({ id: "m1", scope: "workspace", content: "Some content", source: "t", tags: ["urgent"] });
    const results = store.search("urgent");
    expect(results.length).toBe(1);
    expect(results[0].matchType).toBe("tag");
  });

  it("should update items", () => {
    store.add({ id: "m1", scope: "workspace", content: "Original", source: "t" });
    store.update("m1", { content: "Updated" });

    const item = store.get("m1");
    expect(item?.content).toBe("Updated");
    expect(item?.updatedAt).toBeDefined();
  });

  it("should delete items", () => {
    store.add({ id: "m1", scope: "workspace", content: "Delete me", source: "t" });
    expect(store.delete("m1")).toBe(true);
    expect(store.get("m1")).toBeUndefined();
    expect(store.delete("m1")).toBe(false);
  });

  it("should clear items by scope", () => {
    store.add({ id: "m1", scope: "workspace", content: "A", source: "t" });
    store.add({ id: "m2", scope: "session", content: "B", source: "t" });

    const cleared = store.clear("workspace");
    expect(cleared).toBe(1);
    expect(store.getAll()).toHaveLength(1);
  });

  it("should clear all items", () => {
    store.add({ id: "m1", scope: "workspace", content: "A", source: "t" });
    store.add({ id: "m2", scope: "session", content: "B", source: "t" });

    const cleared = store.clear();
    expect(cleared).toBe(2);
    expect(store.getAll()).toHaveLength(0);
  });

  it("should return stats", () => {
    store.add({ id: "m1", scope: "workspace", content: "Hello world", source: "t" });
    store.add({ id: "m2", scope: "session", content: "Test", source: "t" });

    const stats = store.getStats();
    expect(stats.totalItems).toBe(2);
    expect(stats.scopeCounts.workspace).toBe(1);
    expect(stats.scopeCounts.session).toBe(1);
    expect(stats.oldestItem).toBeDefined();
    expect(stats.newestItem).toBeDefined();
  });

  it("should build context within budget", () => {
    for (let i = 0; i < 10; i++) {
      store.add({ id: `m${i}`, scope: "workspace", content: "A".repeat(200), source: "t" });
    }

    const context = store.buildContext("agent_1", 2000);
    expect(context.agentId).toBe("agent_1");
    expect(context.items.length).toBeGreaterThan(0);
    expect(context.items.length).toBeLessThanOrEqual(10);
  });
});

describe("MemoryStore with encryption", () => {
  it("should encrypt and decrypt stored content", () => {
    const store = new MemoryStore(
      createMemoryPolicy({ scope: "workspace", retentionDays: 30, encrypted: true, allowRetrieval: true }),
      "test-key-123",
    );

    store.add({ id: "m1", scope: "workspace", content: "Secret data", source: "t" });
    const raw = (store as unknown as { items: MemoryItem[] }).items[0];
    expect(raw.encrypted).toBe(true);
    expect(raw.content).not.toBe("Secret data");

    const retrieved = store.get("m1");
    expect(retrieved?.content).toBe("Secret data");
  });
});

describe("buildContextFromItems", () => {
  it("should select items within token budget", () => {
    const items: MemoryItem[] = [
      { id: "m1", scope: "workspace", content: "A".repeat(40), source: "t", createdAt: "2026-01-01", tokens: 10 },
      { id: "m2", scope: "workspace", content: "B".repeat(40), source: "t", createdAt: "2026-01-02", tokens: 10 },
      { id: "m3", scope: "workspace", content: "C".repeat(40), source: "t", createdAt: "2026-01-03", tokens: 10 },
    ];

    const result = buildContextFromItems(items, { maxTokens: 100, reservedTokens: 20, compressionEnabled: false });
    expect(result.selectedItems).toHaveLength(3);
    expect(result.totalTokens).toBe(30);
    expect(result.droppedCount).toBe(0);
  });

  it("should drop items exceeding budget", () => {
    const items: MemoryItem[] = [
      { id: "m1", scope: "workspace", content: "A", source: "t", createdAt: "2026-01-01", tokens: 40 },
      { id: "m2", scope: "workspace", content: "B", source: "t", createdAt: "2026-01-02", tokens: 40 },
      { id: "m3", scope: "workspace", content: "C", source: "t", createdAt: "2026-01-03", tokens: 40 },
    ];

    const result = buildContextFromItems(items, { maxTokens: 100, reservedTokens: 20, compressionEnabled: false });
    expect(result.selectedItems.length).toBeLessThan(3);
    expect(result.droppedCount).toBeGreaterThan(0);
  });
});

describe("compressItems", () => {
  it("should return original items if 3 or fewer", () => {
    const items: MemoryItem[] = [
      { id: "m1", scope: "workspace", content: "A", source: "t", createdAt: "2026-01-01" },
      { id: "m2", scope: "workspace", content: "B", source: "t", createdAt: "2026-01-02" },
    ];

    expect(compressItems(items)).toHaveLength(2);
  });

  it("should compress older items into summary", () => {
    const items: MemoryItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: `m${i}`,
      scope: "workspace" as const,
      content: `Item ${i} content`,
      source: "t",
      createdAt: `2026-01-0${i + 1}`,
    }));

    const compressed = compressItems(items);
    expect(compressed.length).toBeLessThan(6);
    expect(compressed.some((i) => i.id.startsWith("compressed_"))).toBe(true);
  });
});
