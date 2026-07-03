const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const DEFAULT_HARNESS_PROMPT =
  "Create a job hunting agent that finds 2026 AI engineer roles, ranks matches, drafts outreach, and tracks applications in workspace memory.";

const STORE_PATH = path.join(__dirname, "..", "data", "harness-store.json");
const JOURNAL_PATH = path.join(__dirname, "..", "data", "harness-journal.jsonl");
const DEFAULT_SOURCES = ["LinkedIn", "Wellfound", "Greenhouse"];

let harnessEntries;
let pgPool;

function listHarnessEntries() {
  return [...harnessEntries];
}

function getLatestHarnessEntry() {
  return harnessEntries[0];
}

function createHarnessEntryFromAssignment(assignment, generation = { source: "fallback" }) {
  const entry = createHarnessViewModel(assignment.request.prompt, generation, assignment);
  harnessEntries.unshift(entry);
  persistHarnessEntries();
  return entry;
}

function findHarnessEntry(agentId, taskId) {
  return (
    harnessEntries.find(
      (entry) =>
        entry.assignment.generatedAgent.id === agentId &&
        entry.assignment.task.id === taskId,
    ) || null
  );
}

function updateHarnessTask(agentId, taskId, action) {
  const entry = findHarnessEntry(agentId, taskId);

  if (!entry) {
    return null;
  }

  const now = new Date().toISOString();

  if (action === "checkpoint") {
    entry.assignment.task.checkpoints.push({
      id: `cp_${taskId}_${entry.assignment.task.checkpoints.length + 1}`,
      status: entry.assignment.task.status,
      at: now,
      note: "Manual checkpoint from UI.",
    });
    appendEvent(entry.assignment.task, "task.checkpointed", now, "Manual checkpoint saved.");
  } else if (action === "retry") {
    entry.assignment.task.status = "running";
    appendEvent(entry.assignment.task, "task.retried", now, "Run resumed from the latest checkpoint.");
  } else if (action === "cancel") {
    entry.assignment.task.status = "canceled";
    entry.research.status = "canceled";
    appendEvent(entry.assignment.task, "task.canceled", now, "Run canceled from the UI.");
  } else {
    return null;
  }

  entry.assignment.task.updatedAt = now;
  syncDerivedState(entry);
  persistHarnessEntries();
  return entry;
}

function appendResearchResult(agentId, taskId, result) {
  const entry = findHarnessEntry(agentId, taskId);

  if (!entry) {
    return null;
  }

  entry.research.results.push(result);
  entry.research.lastUpdatedAt = new Date().toISOString();
  persistHarnessEntries();
  return entry;
}

function updateTaskProgress(agentId, taskId, input) {
  const entry = findHarnessEntry(agentId, taskId);

  if (!entry) {
    return null;
  }

  const now = new Date().toISOString();

  if (typeof input.status === "string") {
    entry.assignment.task.status = input.status;
    entry.research.status = input.status;
  }

  if (typeof input.progress === "number") {
    entry.research.progress = Math.max(0, Math.min(100, input.progress));
  }

  if (typeof input.currentStep === "string") {
    entry.research.currentStep = input.currentStep;
  }

  if (typeof input.completedSteps === "number") {
    entry.research.completedSteps = input.completedSteps;
  }

  if (typeof input.totalSteps === "number") {
    entry.research.totalSteps = input.totalSteps;
  }

  if (Array.isArray(input.sources)) {
    entry.research.sources = input.sources;
  }

  entry.assignment.task.updatedAt = now;
  entry.research.lastUpdatedAt = now;
  syncDerivedState(entry);
  persistHarnessEntries();
  return entry;
}

function appendTaskEvent(agentId, taskId, event) {
  const entry = findHarnessEntry(agentId, taskId);

  if (!entry) {
    return null;
  }

  appendEvent(
    entry.assignment.task,
    event.type,
    event.at || new Date().toISOString(),
    event.message,
    event.data,
  );
  entry.assignment.task.updatedAt = entry.assignment.task.events.at(-1)?.at || new Date().toISOString();
  entry.research.lastUpdatedAt = entry.assignment.task.updatedAt;
  syncDerivedState(entry);
  persistHarnessEntries();
  return entry;
}

async function loadHarnessEntries() {
  const databaseEntries = await readHarnessEntriesFromDatabase();
  if (databaseEntries.length > 0) {
    return databaseEntries;
  }

  const diskEntries = readStoreFile();

  if (diskEntries.length > 0) {
    const normalized = diskEntries.map(normalizeEntry);
    normalized.sort(
      (left, right) =>
        new Date(right.assignment.task.updatedAt || right.assignment.request.createdAt).getTime() -
        new Date(left.assignment.task.updatedAt || left.assignment.request.createdAt).getTime(),
    );
    return normalized;
  }

  const journalEntries = readJournalEntries();
  if (journalEntries.length > 0) {
    const latestByTask = new Map();

    for (const record of journalEntries) {
      if (record?.type === "entry.created" && record.payload) {
        latestByTask.set(record.payload.assignment.task.id, normalizeEntry(record.payload));
      } else if (record?.type === "task.action" && record.payload?.entry) {
        latestByTask.set(
          record.payload.entry.assignment.task.id,
          normalizeEntry(record.payload.entry),
        );
      }
    }

    const recovered = [...latestByTask.values()];
    if (recovered.length > 0) {
      recovered.sort(
        (left, right) =>
          new Date(right.assignment.task.updatedAt || right.assignment.request.createdAt).getTime() -
          new Date(left.assignment.task.updatedAt || left.assignment.request.createdAt).getTime(),
      );
      return recovered;
    }
  }

  const seed = createHarnessViewModel(DEFAULT_HARNESS_PROMPT);
  return [seed];
}

async function initializeHarnessEntries() {
  harnessEntries = await loadHarnessEntries();

  if (harnessEntries.length === 1 && !fs.existsSync(STORE_PATH)) {
    persistHarnessEntries();
  }
}

function readStoreFile() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return [];
    }

    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readJournalEntries() {
  try {
    if (!fs.existsSync(JOURNAL_PATH)) {
      return [];
    }

    const raw = fs.readFileSync(JOURNAL_PATH, "utf8").trim();
    if (!raw) {
      return [];
    }

    return raw
      .split(/\r?\n/)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function persistHarnessEntries() {
  persistHarnessEntriesToDatabase(harnessEntries).catch((error) => {
    console.error("Failed to persist harness store to postgres:", error);
  });

  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(harnessEntries, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to persist harness store:", error);
  }
}

function getDatabaseUrl() {
  return (process.env.DATABASE_URL || "").trim();
}

function getPgPool() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  if (!pgPool) {
    pgPool = new Pool({ connectionString: databaseUrl });
  }

  return pgPool;
}

function ensureDatabaseReady(pool) {
  if (pool.__kaidonHarnessReady) {
    return;
  }

  pool.__kaidonHarnessReady = true;
}

async function readHarnessEntriesFromDatabase() {
  const pool = getPgPool();
  if (!pool) {
    return [];
  }

  try {
    await clientQuery(pool, `
      CREATE TABLE IF NOT EXISTS harness_runs (
        run_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        payload JSONB NOT NULL
      );
    `);
    await clientQuery(pool, `
      CREATE TABLE IF NOT EXISTS harness_run_events (
        id BIGSERIAL PRIMARY KEY,
        run_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_at TIMESTAMPTZ NOT NULL,
        message TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const result = await clientQuery(
      pool,
      "SELECT payload FROM harness_runs ORDER BY updated_at DESC, created_at DESC",
    );
    return (result.rows || []).map((row) => normalizeEntry(row.payload));
  } catch (error) {
    console.error("Failed to read harness entries from postgres:", error);
    return [];
  }
}

async function persistHarnessEntriesToDatabase(entries) {
  const pool = getPgPool();
  if (!pool) {
    return false;
  }

  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS harness_runs (
        run_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        payload JSONB NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS harness_run_events (
        id BIGSERIAL PRIMARY KEY,
        run_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_at TIMESTAMPTZ NOT NULL,
        message TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query("DELETE FROM harness_run_events");
    await client.query("DELETE FROM harness_runs");

    for (const entry of entries) {
      await client.query(
        `
          INSERT INTO harness_runs (run_id, agent_id, task_id, request_id, prompt, status, updated_at, created_at, payload)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `,
        [
          entry.assignment.task.id,
          entry.assignment.generatedAgent.id,
          entry.assignment.task.id,
          entry.assignment.request.id,
          entry.assignment.request.prompt,
          entry.assignment.task.status,
          entry.assignment.task.updatedAt,
          entry.assignment.request.createdAt,
          JSON.stringify(entry),
        ],
      );

      for (const event of entry.assignment.task.events) {
        await client.query(
          `
            INSERT INTO harness_run_events (run_id, event_type, event_at, message, payload)
            VALUES ($1,$2,$3,$4,$5)
          `,
          [entry.assignment.task.id, event.type, event.at, event.message, JSON.stringify(event)],
        );
      }
    }

    return true;
  } finally {
    client.release();
  }
}

async function clientQuery(pool, text, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

function createHarnessViewModel(prompt, generation = { source: "fallback" }, assignment) {
  const effectiveAssignment = assignment || assignHarnessRequest(prompt);
  const createdAt = effectiveAssignment.request.createdAt;
  const task = {
    ...effectiveAssignment.task,
    status: "queued",
    checkpoints: [],
    updatedAt: createdAt,
    events: [
      createEvent("task.created", createdAt, `Task created for ${effectiveAssignment.generatedAgent.name}.`),
    ],
  };
  const timeline = createExecutionTimeline(prompt, task);

  const entry = {
    assignment: {
      ...effectiveAssignment,
      task,
    },
    generation,
    runningTask: task,
    checkpointedTask: task,
    retriedTask: task,
    canceledTask: task,
    enabledTools: buildEnabledTools(prompt),
    contextSnapshot: buildContextSnapshot(effectiveAssignment),
    visibleContextTokens: 128,
    timeline,
    research: {
      query: extractSearchQuery(prompt),
      status: "queued",
      progress: 8,
      completedSteps: 0,
      totalSteps: 6,
      currentStep: "Waiting for the runtime to begin research.",
      sources: inferSources(prompt),
      results: [],
      lastUpdatedAt: createdAt,
    },
  };

  syncDerivedState(entry);
  return entry;
}

function normalizeEntry(entry) {
  const nextEntry = {
    ...entry,
    assignment: {
      ...entry.assignment,
      task: {
        ...entry.assignment.task,
        checkpoints: Array.isArray(entry.assignment.task?.checkpoints)
          ? entry.assignment.task.checkpoints
          : [],
        events: Array.isArray(entry.assignment.task?.events) ? entry.assignment.task.events : [],
        updatedAt:
          entry.assignment.task?.updatedAt ||
          entry.assignment.request?.createdAt ||
          new Date().toISOString(),
      },
    },
    enabledTools: Array.isArray(entry.enabledTools) ? entry.enabledTools : [],
    contextSnapshot: entry.contextSnapshot || buildContextSnapshot(entry.assignment),
    visibleContextTokens:
      typeof entry.visibleContextTokens === "number" ? entry.visibleContextTokens : 128,
    timeline: normalizeTimeline(entry.timeline, entry.assignment.task, entry.assignment.request.prompt),
    research: {
      query: entry.research?.query || extractSearchQuery(entry.assignment.request.prompt),
      status: entry.research?.status || entry.assignment.task?.status || "queued",
      progress:
        typeof entry.research?.progress === "number"
          ? entry.research.progress
          : inferProgressFromEvents(entry.assignment.task?.events || []),
      completedSteps:
        typeof entry.research?.completedSteps === "number"
          ? entry.research.completedSteps
          : inferCompletedSteps(entry.assignment.task?.events || []),
      totalSteps:
        typeof entry.research?.totalSteps === "number" ? entry.research.totalSteps : 6,
      currentStep:
        entry.research?.currentStep || inferCurrentStep(entry.assignment.task?.events || []),
      sources: Array.isArray(entry.research?.sources)
        ? entry.research.sources
        : inferSources(entry.assignment.request.prompt),
      results: Array.isArray(entry.research?.results) ? entry.research.results : [],
      lastUpdatedAt:
        entry.research?.lastUpdatedAt ||
        entry.assignment.task?.updatedAt ||
        entry.assignment.request?.createdAt ||
        new Date().toISOString(),
    },
  };

  syncDerivedState(nextEntry);
  return nextEntry;
}

function syncDerivedState(entry) {
  entry.runningTask = entry.assignment.task;
  entry.checkpointedTask = entry.assignment.task;
  entry.retriedTask = entry.assignment.task;
  entry.canceledTask = entry.assignment.task;
  entry.timeline = normalizeTimeline(entry.timeline, entry.assignment.task, entry.assignment.request.prompt);
}

function buildEnabledTools(prompt) {
  const wantsJobs = /job|career|resume|linkedin|interview|engineer|role/i.test(prompt);

  return [
    {
      id: wantsJobs ? "tool_job_search" : "tool_search",
      name: wantsJobs ? "Job search" : "Search",
      description: wantsJobs
        ? "Search and rank open roles from approved job sources."
        : "Search approved public sources.",
      scope: "workspace",
      transport: "mcp",
      permissions: ["read"],
      version: "0.1.0",
    },
    {
      id: wantsJobs ? "tool_outreach" : "tool_memory",
      name: wantsJobs ? "Outreach drafting" : "Memory update",
      description: wantsJobs
        ? "Draft recruiter messages and application notes."
        : "Write back durable context for the task.",
      scope: "workspace",
      transport: "http",
      permissions: ["write"],
      version: "0.1.0",
    },
    {
      id: wantsJobs ? "tool_application_tracker" : "tool_reasoner",
      name: wantsJobs ? "Application tracker" : "Reasoning",
      description: wantsJobs
        ? "Track target companies, outreach state, and follow-ups."
        : "Track task progress and next decisions.",
      scope: "workspace",
      transport: "http",
      permissions: ["write"],
      version: "0.1.0",
    },
  ];
}

function buildContextSnapshot(assignment) {
  return {
    agentId: assignment.generatedAgent.id,
    summary: "Workspace context preserved for the current agent workflow.",
    items: [
      {
        id: "mem_1",
        scope: "workspace",
        content: "Target roles include AI engineer, agent engineer, and full-stack AI roles.",
        source: assignment.task.id,
      },
      {
        id: "mem_2",
        scope: "session",
        content: "User prefers 2026 openings with remote or hybrid options.",
        source: assignment.task.id,
      },
    ],
    budget: {
      maxTokens: 8192,
      reservedTokens: 1024,
      compressionEnabled: true,
    },
    policy: {
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
      allowRetrieval: true,
    },
  };
}

function assignHarnessRequest(prompt, requestedBy = "studio-user") {
  const request = createHarnessRequest(prompt, requestedBy);
  const workItem = createHarnessWorkItem(request);
  const generatedAgent = createAgentFromPrompt(request);
  const task = createRuntimeTask(generatedAgent, {
    requestId: request.id,
    workItemId: workItem.id,
    prompt: request.prompt,
  });

  return {
    request,
    workItem: {
      ...workItem,
      status: "ready",
    },
    generatedAgent,
    task,
  };
}

function createHarnessRequest(prompt, requestedBy) {
  return {
    id: `req_${Date.now()}`,
    prompt,
    requestedBy,
    createdAt: new Date().toISOString(),
  };
}

function createHarnessWorkItem(request, assignedAgent = "agent-builder") {
  const slug = slugify(request.prompt);

  return {
    id: `work_${slug}`,
    requestId: request.id,
    title: `Generate ${slug}`,
    summary: request.prompt,
    assignedAgent,
    status: "assigned",
  };
}

function createAgentFromPrompt(request) {
  const slug = slugify(request.prompt);
  const wantsJobs = /job|career|resume|linkedin|interview|engineer|role/i.test(request.prompt);

  return {
    id: slug,
    name: slug,
    version: "0.1.0",
    description: request.prompt.trim(),
    model: {
      provider: "openrouter",
      model: (process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free").trim(),
      family: "open-source",
    },
    tools: [
      {
        id: wantsJobs ? "tool_job_search" : "tool_search",
        name: wantsJobs ? "Job search" : "Search",
        required: true,
      },
      {
        id: wantsJobs ? "tool_outreach" : "tool_memory",
        name: wantsJobs ? "Outreach drafting" : "Memory update",
        required: true,
      },
      {
        id: wantsJobs ? "tool_application_tracker" : "tool_reasoner",
        name: wantsJobs ? "Application tracker" : "Reasoning",
        required: true,
      },
    ],
    memory: {
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
    },
    status: "ready",
  };
}

function createRuntimeTask(agent, input) {
  const now = new Date().toISOString();

  return {
    id: `task_${agent.id}_${Date.now()}`,
    agent,
    status: "queued",
    input,
    checkpoints: [],
    events: [createEvent("task.created", now, `Task created for ${agent.name}.`)],
    updatedAt: now,
  };
}

function createExecutionTimeline(prompt, task) {
  const isJobSearch = /job|career|resume|linkedin|interview|engineer|role/i.test(prompt);
  const createdAt = task.updatedAt || new Date().toISOString();
  const events = task.events.map((event, index) => ({
    id: `${task.id}_timeline_${index + 1}`,
    type: event.type,
    title: humanizeEventType(event.type),
    description: event.message,
    at: event.at,
    state: index === 0 ? "started" : event.type.includes("completed") ? "done" : "active",
  }));

  return {
    query: extractSearchQuery(prompt),
    stage: isJobSearch ? "Research" : "Execution",
    progress: 8,
    remainingSteps: 5,
    phases: [
      { id: "discover", label: "Discover", status: "complete", hint: "Clarify request and constraints." },
      { id: "search", label: "Search", status: "active", hint: "Check approved sources." },
      { id: "rank", label: "Rank", status: "pending", hint: "Compare matches and trade-offs." },
      { id: "draft", label: "Draft", status: "pending", hint: "Prepare output for the user." },
      { id: "track", label: "Track", status: "pending", hint: "Persist the result for follow-up." },
    ],
    events,
    lastUpdatedAt: createdAt,
  };
}

function normalizeTimeline(timeline, task, prompt) {
  if (timeline && Array.isArray(timeline.events) && Array.isArray(timeline.phases)) {
    return {
      ...timeline,
      query: timeline.query || extractSearchQuery(prompt),
      stage: timeline.stage || "Execution",
      remainingSteps:
        typeof timeline.remainingSteps === "number" ? timeline.remainingSteps : 5,
      progress: typeof timeline.progress === "number" ? timeline.progress : 8,
      lastUpdatedAt: timeline.lastUpdatedAt || task.updatedAt,
    };
  }

  return createExecutionTimeline(prompt, task);
}

function humanizeEventType(type) {
  return type
    .replace(/\./g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createEvent(type, at, message, data) {
  return {
    type,
    at,
    message,
    ...(data ? { data } : {}),
  };
}

function appendEvent(task, type, at, message, data) {
  task.events.push(createEvent(type, at, message, data));
}

function inferSources(prompt) {
  if (/job|career|resume|linkedin|interview|engineer|role/i.test(prompt)) {
    return DEFAULT_SOURCES;
  }

  return ["Search", "Memory", "Planner"];
}

function inferCompletedSteps(events) {
  const order = [
    "task.started",
    "planning.completed",
    "search.source.started",
    "search.result.collected",
    "candidates.ranked",
    "outreach.prepared",
  ];

  const seen = new Set(events.map((event) => event.type));
  return order.filter((type) => seen.has(type)).length;
}

function inferProgressFromEvents(events) {
  const completed = inferCompletedSteps(events);
  return completed === 0 ? 8 : Math.min(100, Math.round((completed / 6) * 100));
}

function inferCurrentStep(events) {
  const lastEvent = events.at(-1);
  return lastEvent?.message || "Waiting for the runtime to begin research.";
}

function extractSearchQuery(prompt) {
  const explicitMatch = prompt.match(/for this user request:\s*(.+)$/i);
  if (explicitMatch?.[1]) {
    return explicitMatch[1].trim();
  }
  return prompt.trim();
}

function slugify(input) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "generated-agent"
  );
}

module.exports = {
  DEFAULT_HARNESS_PROMPT,
  appendResearchResult,
  appendTaskEvent,
  createHarnessEntryFromAssignment,
  findHarnessEntry,
  getLatestHarnessEntry,
  initializeHarnessEntries,
  listHarnessEntries,
  persistHarnessEntries,
  updateHarnessTask,
  updateTaskProgress,
};
