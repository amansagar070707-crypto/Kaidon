"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            workspace: String(formData.get("workspace") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error ?? "Authentication failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form method="post" action={`/api/auth/${mode}`} onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
      {mode === "signup" && (
        <>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
              Name
            </label>
            <input name="name" required className="input" placeholder="Aman" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
              Workspace
            </label>
            <input name="workspace" required className="input" placeholder="Operations" />
          </div>
        </>
      )}
      <div>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
          Email
        </label>
        <input type="email" name="email" required className="input" placeholder="you@company.com" />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
          Password
        </label>
        <input type="password" name="password" required minLength={8} className="input" placeholder="At least 8 characters" />
      </div>
      {error && (
        <div style={{ padding: "10px", background: "rgba(238, 0, 0, 0.1)", border: "1px solid rgba(238, 0, 0, 0.2)", borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "14px" }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn--primary btn--lg" style={{ width: "100%" }}>
        {isSubmitting ? "Please wait..." : mode === "signup" ? "Create workspace" : "Log in"}
      </button>
    </form>
  );
}
