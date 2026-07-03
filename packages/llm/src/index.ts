import type { AgentModelConfig } from "@kaidon/apl";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_API_KEY_ENV = "OPENROUTER_API_KEY";
export const OPENROUTER_MODEL_ENV = "OPENROUTER_MODEL";

export type OpenRouterAppConfig = {
  apiKeyEnv: typeof OPENROUTER_API_KEY_ENV;
  baseUrl: typeof OPENROUTER_BASE_URL;
  siteUrl?: string;
  appTitle?: string;
};

export type OpenRouterChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterChatRequest = {
  model: string;
  messages: OpenRouterChatMessage[];
};

export type GeneratedAgentDraft = {
  name: string;
  description: string;
  tools: Array<{
    id: string;
    name: string;
    required: boolean;
  }>;
  memory: {
    scope: "session" | "workspace" | "global";
    retentionDays?: number;
    encrypted?: boolean;
  };
};

export type OpenRouterRuntimeConfig = OpenRouterAppConfig & {
  apiKey?: string;
  configured: boolean;
  model: AgentModelConfig;
};

export type AgentGenerationResult =
  | {
      ok: true;
      mode: "live" | "fallback";
      draft: GeneratedAgentDraft;
    }
  | {
      ok: false;
      mode: "live" | "fallback";
      error: string;
      fallbackDraft: GeneratedAgentDraft;
    };

export const DEFAULT_OPENROUTER_MODEL: AgentModelConfig = {
  provider: "openrouter",
  model: "moonshotai/kimi-k2:free",
  family: "open-source",
};

type EnvSource = Record<string, string | undefined>;

export function createOpenRouterConfig(
  overrides: Partial<OpenRouterAppConfig> = {},
): OpenRouterAppConfig {
  return {
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    baseUrl: OPENROUTER_BASE_URL,
    appTitle: "Kaidon",
    siteUrl: "http://localhost:3000",
    ...overrides,
  };
}

export function resolveOpenRouterModel(
  env: EnvSource = readRuntimeEnv(),
  fallback: AgentModelConfig = DEFAULT_OPENROUTER_MODEL,
): AgentModelConfig {
  const model = env[OPENROUTER_MODEL_ENV]?.trim();

  if (!model) {
    return fallback;
  }

  return {
    ...fallback,
    model,
  };
}

export function getOpenRouterRuntimeConfig(
  env: EnvSource = readRuntimeEnv(),
  overrides: Partial<OpenRouterAppConfig> = {},
): OpenRouterRuntimeConfig {
  const apiKey = env[OPENROUTER_API_KEY_ENV]?.trim();

  return {
    ...createOpenRouterConfig(overrides),
    apiKey,
    configured: Boolean(apiKey),
    model: resolveOpenRouterModel(env),
  };
}

export function createOpenRouterRequest(
  model: AgentModelConfig,
  messages: OpenRouterChatMessage[],
): OpenRouterChatRequest {
  return {
    model: model.model,
    messages,
  };
}

export async function generateAgentDraft(
  prompt: string,
  options: {
    env?: EnvSource;
    fetcher?: typeof fetch;
  } = {},
): Promise<AgentGenerationResult> {
  const env = options.env ?? readRuntimeEnv();
  const runtimeConfig = getOpenRouterRuntimeConfig(env);
  const fallbackDraft = createFallbackAgentDraft(prompt);

  if (!runtimeConfig.configured) {
    return {
      ok: false,
      mode: "fallback",
      error: "OPENROUTER_API_KEY is not configured.",
      fallbackDraft,
    };
  }

  if (env.OPENROUTER_ENABLE_LIVE_GENERATION !== "true") {
    return {
      ok: true,
      mode: "fallback",
      draft: fallbackDraft,
    };
  }

  const fetcher = options.fetcher ?? getRuntimeFetch();

  if (!fetcher) {
    return {
      ok: false,
      mode: "fallback",
      error: "Fetch is not available in the current runtime.",
      fallbackDraft,
    };
  }

  try {
    const response = await fetcher(`${runtimeConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runtimeConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        createOpenRouterRequest(runtimeConfig.model, [
          {
            role: "system",
            content:
              "Return only JSON with keys name, description, tools, memory. tools must be an array of {id,name,required}. memory must include scope, retentionDays, encrypted.",
          },
          {
            role: "user",
            content: `Generate an agent draft for this request: ${prompt}`,
          },
        ]),
      ),
    });

    if (!response.ok) {
      return {
        ok: false,
        mode: "live",
        error: `OpenRouter request failed with status ${response.status}.`,
        fallbackDraft,
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        ok: false,
        mode: "live",
        error: "OpenRouter returned an empty completion.",
        fallbackDraft,
      };
    }

    const draft = parseGeneratedAgentDraft(content);

    if (!draft) {
      return {
        ok: false,
        mode: "live",
        error: "OpenRouter returned invalid JSON for the agent draft.",
        fallbackDraft,
      };
    }

    return {
      ok: true,
      mode: "live",
      draft,
    };
  } catch (error) {
    return {
      ok: false,
      mode: "live",
      error: error instanceof Error ? error.message : "Unknown OpenRouter error.",
      fallbackDraft,
    };
  }
}

function readRuntimeEnv(): EnvSource {
  const runtime = globalThis as typeof globalThis & {
    process?: {
      env?: EnvSource;
    };
  };

  return runtime.process?.env ?? {};
}

function getRuntimeFetch(): typeof fetch | undefined {
  const runtime = globalThis as typeof globalThis & {
    fetch?: typeof fetch;
  };

  return runtime.fetch;
}

function createFallbackAgentDraft(prompt: string): GeneratedAgentDraft {
  const normalizedPrompt = prompt.trim();
  const wantsApproval = /approval|approve|refund/i.test(prompt);
  const wantsBilling = /billing|invoice|refund|payment/i.test(prompt);
  const slug = slugify(prompt);

  return {
    name: slug,
    description: normalizedPrompt,
    tools: [
      {
        id: wantsBilling ? "tool_billing" : "tool_search",
        name: wantsBilling ? "Billing lookup" : "Search",
        required: true,
      },
      {
        id: wantsApproval ? "tool_approval" : "tool_email",
        name: wantsApproval ? "Approval" : "Email",
        required: true,
      },
    ],
    memory: {
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
    },
  };
}

function parseGeneratedAgentDraft(content: string): GeneratedAgentDraft | null {
  try {
    const parsed = JSON.parse(content) as Partial<GeneratedAgentDraft>;

    if (
      typeof parsed.name !== "string" ||
      typeof parsed.description !== "string" ||
      !Array.isArray(parsed.tools) ||
      !parsed.memory ||
      typeof parsed.memory.scope !== "string"
    ) {
      return null;
    }

    return {
      name: parsed.name,
      description: parsed.description,
      tools: parsed.tools
        .filter(
          (tool): tool is GeneratedAgentDraft["tools"][number] =>
            Boolean(
              tool &&
                typeof tool.id === "string" &&
                typeof tool.name === "string" &&
                typeof tool.required === "boolean",
            ),
        )
        .slice(0, 6),
      memory: {
        scope:
          parsed.memory.scope === "session" || parsed.memory.scope === "global"
            ? parsed.memory.scope
            : "workspace",
        retentionDays:
          typeof parsed.memory.retentionDays === "number"
            ? parsed.memory.retentionDays
            : 30,
        encrypted:
          typeof parsed.memory.encrypted === "boolean"
            ? parsed.memory.encrypted
            : true,
      },
    };
  } catch {
    return null;
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "generated-agent";
}
