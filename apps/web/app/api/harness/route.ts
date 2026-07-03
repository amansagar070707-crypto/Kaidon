import { NextResponse } from "next/server";

const serverUrl = process.env.KAIDON_SERVER_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${serverUrl}/api/harness`, {
      cache: "no-store",
    });

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Harness backend is unavailable.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  try {
    const response = await fetch(`${serverUrl}/api/harness`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: body.prompt }),
    });

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Harness backend is unavailable.",
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    agentId?: string;
    taskId?: string;
    action?: "checkpoint" | "retry" | "cancel";
  };

  try {
    const response = await fetch(`${serverUrl}/api/harness/actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Harness backend is unavailable.",
      },
      { status: 503 },
    );
  }
}
