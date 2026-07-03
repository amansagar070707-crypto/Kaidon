import { NextResponse } from "next/server";

import { kaidonServerUrl } from "../../../../lib/api/server-url";

export async function POST(request: Request) {
  const body = await readAuthBody(request);
  const response = await fetch(`${kaidonServerUrl}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body.payload),
  });
  const payload = await response.json();
  const nextResponse =
    body.isFormPost && response.ok
      ? NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 })
      : NextResponse.json(payload, { status: response.status });
  const cookie = response.headers.get("set-cookie");

  if (cookie) {
    nextResponse.headers.set("set-cookie", cookie);
  }

  return nextResponse;
}

async function readAuthBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();

    return {
      isFormPost: true,
      payload: {
        name: String(form.get("name") ?? ""),
        workspace: String(form.get("workspace") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      },
    };
  }

  return {
    isFormPost: false,
    payload: await request.json(),
  };
}
