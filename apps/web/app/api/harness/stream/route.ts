const serverUrl = process.env.KAIDON_SERVER_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  const taskId = url.searchParams.get("taskId");

  if (!agentId || !taskId) {
    return new Response(JSON.stringify({ error: "agentId and taskId are required." }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const upstream = await fetch(
      `${serverUrl}/api/harness?agentId=${encodeURIComponent(agentId)}&taskId=${encodeURIComponent(taskId)}&stream=1`,
      {
        cache: "no-store",
      },
    );

    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: "Harness backend stream is unavailable." }), {
        status: upstream.status || 503,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Harness backend stream is unavailable." }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
