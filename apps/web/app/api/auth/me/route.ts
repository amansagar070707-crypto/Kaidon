import { NextResponse } from "next/server";

import { kaidonServerUrl } from "../../../../lib/api/server-url";

export async function GET(request: Request) {
  const response = await fetch(`${kaidonServerUrl}/api/auth/me`, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  const payload = await response.json();

  return NextResponse.json(payload, { status: response.status });
}
