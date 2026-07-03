import { getOpenRouterRuntimeConfig } from "@kaidon/llm";

export type ProviderStatus = {
  configured: boolean;
  provider: string;
  model: string;
  baseUrl: string;
  appTitle?: string;
};

const serverUrl = process.env.KAIDON_SERVER_URL ?? "http://localhost:8000";

export async function getProviderStatus(): Promise<ProviderStatus> {
  try {
    const response = await fetch(`${serverUrl}/health`, {
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        provider?: Partial<ProviderStatus>;
      };

      if (
        payload.provider &&
        typeof payload.provider.configured === "boolean" &&
        typeof payload.provider.provider === "string" &&
        typeof payload.provider.model === "string" &&
        typeof payload.provider.baseUrl === "string"
      ) {
        return {
          configured: payload.provider.configured,
          provider: payload.provider.provider,
          model: payload.provider.model,
          baseUrl: payload.provider.baseUrl,
          appTitle: payload.provider.appTitle,
        };
      }
    }
  } catch {
    // Fall back to local runtime config when the backend is offline.
  }

  return getFallbackProviderStatus();
}

function getFallbackProviderStatus(): ProviderStatus {
  const config = getOpenRouterRuntimeConfig();

  return {
    configured: config.configured,
    provider: config.model.provider,
    model: config.model.model,
    baseUrl: config.baseUrl,
    appTitle: config.appTitle,
  };
}
