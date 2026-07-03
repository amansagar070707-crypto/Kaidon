import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const DATA_DIR = path.join(__dirname, "..", "data");
const AUTH_STORE = path.join(DATA_DIR, "auth-store.json");
const HARNESS_STORE = path.join(DATA_DIR, "harness-store.json");

// ─── Auth Store Tests ────────────────────────────────────

describe("auth-store", () => {
  let authStore;

  beforeEach(() => {
    try { fs.unlinkSync(AUTH_STORE); } catch {}
    delete require.cache[require.resolve("../src/auth-store")];
    authStore = require("../src/auth-store");
  });

  afterEach(() => {
    try { fs.unlinkSync(AUTH_STORE); } catch {}
  });

  it("should register a new user", () => {
    const result = authStore.registerUser({
      name: "Test User",
      email: "test@example.com",
      workspace: "test-workspace",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
    expect(result.user.name).toBe("Test User");
    expect(result.user.email).toBe("test@example.com");
    expect(result.session).toBeDefined();
    expect(result.session.token).toMatch(/^sess_/);
  });

  it("should reject duplicate email", () => {
    authStore.registerUser({
      name: "Test User",
      email: "test@example.com",
      workspace: "test-workspace",
      password: "password123",
    });

    const result = authStore.registerUser({
      name: "Another User",
      email: "test@example.com",
      workspace: "another-workspace",
      password: "password456",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.error).toContain("already exists");
  });

  it("should reject missing fields", () => {
    const result = authStore.registerUser({
      name: "",
      email: "",
      workspace: "",
      password: "short",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it("should login with correct credentials", () => {
    authStore.registerUser({
      name: "Test User",
      email: "test@example.com",
      workspace: "test-workspace",
      password: "password123",
    });

    const result = authStore.loginUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.user.email).toBe("test@example.com");
  });

  it("should reject wrong password", () => {
    authStore.registerUser({
      name: "Test User",
      email: "test@example.com",
      workspace: "test-workspace",
      password: "password123",
    });

    const result = authStore.loginUser({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it("should get user by valid session", () => {
    const reg = authStore.registerUser({
      name: "Test User",
      email: "test-session@example.com",
      workspace: "test-workspace",
      password: "password123",
    });

    const user = authStore.getUserBySession(reg.session.token);
    expect(user).toBeDefined();
    expect(user.email).toBe("test-session@example.com");
  });

  it("should return null for invalid session", () => {
    const user = authStore.getUserBySession("invalid_token");
    expect(user).toBeNull();
  });
});

// ─── Harness Store Tests ─────────────────────────────────

describe("harness-store", () => {
  let harnessStore;

  beforeEach(async () => {
    try { fs.unlinkSync(HARNESS_STORE); } catch {}
    delete require.cache[require.resolve("../src/harness-store")];
    harnessStore = require("../src/harness-store");
    await harnessStore.initializeHarnessEntries();
  });

  it("should initialize with seed entry", () => {
    const entries = harnessStore.listHarnessEntries();
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it("should get latest entry", () => {
    const latest = harnessStore.getLatestHarnessEntry();
    expect(latest).toBeDefined();
    expect(latest.assignment).toBeDefined();
  });

  it("should create entry from assignment", () => {
    const assignment = {
      request: { id: "req_test", prompt: "Test prompt", requestedBy: "test", createdAt: new Date().toISOString() },
      workItem: { id: "work_test", requestId: "req_test", title: "Test", summary: "Test", assignedAgent: "test", status: "ready" },
      generatedAgent: { id: "agent_test", name: "Test Agent", version: "0.1.0", description: "Test", model: { provider: "openrouter", model: "test", family: "open-source" }, tools: [], memory: { scope: "workspace", retentionDays: 30, encrypted: true }, status: "ready" },
      task: { id: "task_test", agent: {}, status: "queued", input: {}, checkpoints: [], events: [], updatedAt: new Date().toISOString() },
    };

    const entry = harnessStore.createHarnessEntryFromAssignment(assignment);
    expect(entry.assignment.generatedAgent.id).toBe("agent_test");
  });

  it("should find entry by agent and task id", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const found = harnessStore.findHarnessEntry(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
    );
    expect(found).toBeDefined();
  });

  it("should return null for unknown entry", () => {
    const found = harnessStore.findHarnessEntry("unknown", "unknown");
    expect(found).toBeNull();
  });

  it("should update task with checkpoint action", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const updated = harnessStore.updateHarnessTask(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      "checkpoint",
    );
    expect(updated).toBeDefined();
    expect(updated.assignment.task.checkpoints.length).toBeGreaterThan(0);
  });

  it("should update task with retry action", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const updated = harnessStore.updateHarnessTask(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      "retry",
    );
    expect(updated).toBeDefined();
    expect(updated.assignment.task.status).toBe("running");
  });

  it("should update task with cancel action", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const updated = harnessStore.updateHarnessTask(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      "cancel",
    );
    expect(updated).toBeDefined();
    expect(updated.assignment.task.status).toBe("canceled");
  });

  it("should return null for unknown action", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const updated = harnessStore.updateHarnessTask(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      "unknown",
    );
    expect(updated).toBeNull();
  });

  it("should append research result", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const result = harnessStore.appendResearchResult(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      { title: "Test Result", url: "https://example.com", snippet: "Test snippet", source: "test" },
    );
    expect(result).toBeDefined();
    expect(result.research.results.length).toBeGreaterThan(0);
  });

  it("should update task progress", () => {
    const entries = harnessStore.listHarnessEntries();
    const first = entries[0];
    const updated = harnessStore.updateTaskProgress(
      first.assignment.generatedAgent.id,
      first.assignment.task.id,
      { status: "running", progress: 50, currentStep: "Testing" },
    );
    expect(updated).toBeDefined();
    expect(updated.research.progress).toBe(50);
  });
});

// ─── Streaming LLM Tests ─────────────────────────────────

describe("streaming LLM", () => {
  it("should parse SSE chunks correctly", () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}',
      'data: {"choices":[{"delta":{"content":" world"}}]}',
      'data: [DONE]',
    ];

    const tokens = [];
    let fullContent = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      const parsed = JSON.parse(payload);
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) {
        tokens.push(delta);
        fullContent += delta;
      }
    }

    expect(tokens).toEqual(["Hello", " world"]);
    expect(fullContent).toBe("Hello world");
  });

  it("should handle malformed JSON gracefully", () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"OK"}}]}',
      "data: {invalid json",
      'data: {"choices":[{"delta":{"content":"done"}}]}',
    ];

    const tokens = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) tokens.push(delta);
      } catch {
        // skip malformed
      }
    }

    expect(tokens).toEqual(["OK", "done"]);
  });

  it("should extract usage from final chunk", () => {
    const lines = [
      'data: {"choices":[{"delta":{"content":"hi"}}]}',
      'data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5}}',
      "data: [DONE]",
    ];

    let usage = null;
    let fullContent = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      const parsed = JSON.parse(payload);
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) fullContent += delta;
      if (parsed.usage) usage = parsed.usage;
    }

    expect(fullContent).toBe("hi");
    expect(usage).toEqual({ prompt_tokens: 10, completion_tokens: 5 });
  });
});
