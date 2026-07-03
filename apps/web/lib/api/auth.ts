import { cookies } from "next/headers";

import { kaidonServerUrl } from "./server-url";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  workspace: string;
  role: string;
  createdAt: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
      .join("; ");
    const response = await fetch(`${kaidonServerUrl}/api/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { user?: AuthUser };
    return payload.user ?? null;
  } catch {
    return null;
  }
}
