import type { AgentDefinition } from "@kaidon/apl";

// ─── Types ───────────────────────────────────────────────

export type KaidonConfig = {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
};

export type KaidonUser = {
  id: string;
  name: string;
  email: string;
  workspace: string;
  role: string;
  createdAt: string;
};

export type KaidonSession = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type HarnessEntry = {
  assignment: {
    request: { id: string; prompt: string; requestedBy: string; createdAt: string };
    workItem: { id: string; requestId: string; title: string; summary: string; assignedAgent: string; status: string };
    generatedAgent: AgentDefinition;
    task: {
      id: string;
      agent: AgentDefinition;
      status: string;
      input: { requestId: string; workItemId: string; prompt: string };
      checkpoints: Array<{ id: string; status: string; at: string; note: string }>;
      events: Array<{ type: string; at: string; message: string; data?: unknown }>;
      updatedAt: string;
    };
  };
  generation: { source: string; error?: string };
  research: {
    query: string;
    status: string;
    progress: number;
    completedSteps: number;
    totalSteps: number;
    currentStep: string;
    sources: string[];
    results: Array<{ title: string; url: string; snippet: string; source: string }>;
    lastUpdatedAt: string;
  };
  timeline: {
    query: string;
    stage: string;
    progress: number;
    remainingSteps: number;
    phases: Array<{ id: string; label: string; status: string; hint: string }>;
    events: Array<{ id: string; type: string; title: string; description: string; at: string; state: string }>;
    lastUpdatedAt: string;
  };
};

export type ProviderInfo = {
  configured: boolean;
  model: string;
  provider: string;
  baseUrl: string;
};

export type SSEEvent = {
  event: string;
  data: unknown;
};

// ─── SDK Client ──────────────────────────────────────────

export class KaidonClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;
  private sessionToken: string | null = null;

  constructor(config: KaidonConfig = {}) {
    this.baseUrl = (config.baseUrl || "http://localhost:8000").replace(/\/$/, "");
    this.timeout = config.timeout || 30_000;
    this.headers = { ...config.headers };
  }

  setSession(token: string): void {
    this.sessionToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.headers,
    };

    if (this.sessionToken) {
      headers["Cookie"] = `kaidon_session=${this.sessionToken}`;
    }

    return headers;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new KaidonError(
          data.error || `Request failed with status ${response.status}`,
          response.status,
          data,
        );
      }

      return data as T;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Auth ────────────────────────────────────────────

  async register(input: {
    name: string;
    email: string;
    workspace: string;
    password: string;
  }): Promise<{ user: KaidonUser; session: KaidonSession }> {
    const result = await this.request<{ user: KaidonUser; session: KaidonSession }>(
      "POST",
      "/api/auth/signup",
      input,
    );
    this.sessionToken = result.session.token;
    return result;
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: KaidonUser; session: KaidonSession }> {
    const result = await this.request<{ user: KaidonUser; session: KaidonSession }>(
      "POST",
      "/api/auth/login",
      input,
    );
    this.sessionToken = result.session.token;
    return result;
  }

  async getMe(): Promise<{ user: KaidonUser }> {
    return this.request<{ user: KaidonUser }>("GET", "/api/auth/me");
  }

  // ─── Harness ─────────────────────────────────────────

  async createHarness(prompt: string): Promise<{
    item: HarnessEntry;
    generation: { mode: string; ok: boolean; error?: string };
    provider: ProviderInfo;
  }> {
    return this.request("POST", "/api/harness", { prompt });
  }

  async listHarness(): Promise<{
    latest: HarnessEntry | null;
    items: HarnessEntry[];
    provider: ProviderInfo;
  }> {
    return this.request("GET", "/api/harness");
  }

  async getHarnessEntry(agentId: string, taskId: string): Promise<{
    item: HarnessEntry;
    provider: ProviderInfo;
  }> {
    return this.request("GET", `/api/harness?agentId=${agentId}&taskId=${taskId}`);
  }

  async executeHarnessAction(
    agentId: string,
    taskId: string,
    action: "checkpoint" | "retry" | "cancel",
  ): Promise<{ item: HarnessEntry; provider: ProviderInfo }> {
    return this.request("POST", "/api/harness/actions", { agentId, taskId, action });
  }

  // ─── Streaming ───────────────────────────────────────

  subscribeToRun(
    agentId: string,
    taskId: string,
    onEvent: (event: SSEEvent) => void,
  ): () => void {
    const url = `${this.baseUrl}/api/harness?agentId=${agentId}&taskId=${taskId}&stream=1`;
    const eventSource = new EventSource(url);

    const handler = (event: MessageEvent) => {
      onEvent({ event: event.type, data: JSON.parse(event.data) });
    };

    eventSource.addEventListener("snapshot", handler);
    eventSource.addEventListener("llm.token", handler);
    eventSource.addEventListener("llm.complete", handler);
    eventSource.addEventListener("complete", handler);
    eventSource.addEventListener("error", () => {
      onEvent({ event: "error", data: { message: "SSE connection error" } });
    });

    return () => {
      eventSource.close();
    };
  }

  // ─── Health ──────────────────────────────────────────

  async health(): Promise<{ ok: boolean; service: string; provider: ProviderInfo }> {
    return this.request("GET", "/health");
  }
}

// ─── Error Class ─────────────────────────────────────────

export class KaidonError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "KaidonError";
    this.status = status;
    this.data = data;
  }
}

// ─── Factory ─────────────────────────────────────────────

export function createKaidon(config?: KaidonConfig): KaidonClient {
  return new KaidonClient(config);
}
