import type { HarnessViewModel } from "../state/harness";

const serverUrl = process.env.KAIDON_SERVER_URL ?? "http://localhost:8000";

type HarnessListPayload = {
  latest?: HarnessViewModel;
  items?: HarnessViewModel[];
};

type HarnessItemPayload = {
  item?: HarnessViewModel;
};

export async function fetchHarnessList(): Promise<{
  latest: HarnessViewModel | null;
  items: HarnessViewModel[];
  error: string | null;
}> {
  try {
    const response = await fetch(`${serverUrl}/api/harness`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        latest: null,
        items: [],
        error: `Harness backend returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as HarnessListPayload;

    return {
      latest: payload.latest ?? null,
      items: payload.items ?? [],
      error: payload.latest ? null : "Harness backend returned no latest run.",
    };
  } catch {
    return {
      latest: null,
      items: [],
      error: "Harness backend is unavailable.",
    };
  }
}

export async function fetchHarnessItem(agentId: string, taskId: string): Promise<{
  item: HarnessViewModel | null;
  error: string | null;
}> {
  try {
    const response = await fetch(
      `${serverUrl}/api/harness?agentId=${encodeURIComponent(agentId)}&taskId=${encodeURIComponent(taskId)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return {
        item: null,
        error: response.status === 404 ? "Harness run not found." : `Harness backend returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as HarnessItemPayload;

    return {
      item: payload.item ?? null,
      error: payload.item ? null : "Harness backend returned no run item.",
    };
  } catch {
    return {
      item: null,
      error: "Harness backend is unavailable.",
    };
  }
}

export async function postHarnessAction(input: {
  agentId: string;
  taskId: string;
  action: "checkpoint" | "retry" | "cancel";
}): Promise<{
  item: HarnessViewModel | null;
  error: string | null;
}> {
  try {
    const response = await fetch("/api/harness", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        item: null,
        error: `Harness backend returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as HarnessItemPayload;

    return {
      item: payload.item ?? null,
      error: payload.item ? null : "Harness backend returned no updated item.",
    };
  } catch {
    return {
      item: null,
      error: "Harness backend is unavailable.",
    };
  }
}
