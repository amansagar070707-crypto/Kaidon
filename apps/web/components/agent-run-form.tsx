"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type AgentRunFormProps = {
  agentId: string;
  agentName: string;
};

export function AgentRunForm({ agentId, agentName }: AgentRunFormProps) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("Find 2026 AI engineer jobs.");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsRunning(true);

    const response = await fetch("/api/harness", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Run ${agentName} (${agentId}) for this user request: ${instruction}`,
      }),
    });
    const payload = (await response.json()) as {
      error?: string;
      item?: {
        assignment: {
          generatedAgent: { id: string };
          task: { id: string };
        };
      };
    };

    setIsRunning(false);

    if (!response.ok || !payload.item) {
      setError(payload.error ?? "Unable to start this agent run.");
      return;
    }

    router.push(
      `/runtime/${payload.item.assignment.generatedAgent.id}/${payload.item.assignment.task.id}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
      <div>
        <label className="text-sm text-muted" style={{ display: "block", marginBottom: "4px" }}>
          Ask this agent to do work
        </label>
        <textarea
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          className="textarea"
          aria-label="Agent run instruction"
          rows={4}
        />
      </div>
      {error && (
        <div style={{ padding: "10px", background: "rgba(238, 0, 0, 0.1)", border: "1px solid rgba(238, 0, 0, 0.2)", borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "14px" }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={isRunning || !instruction.trim()} className="btn btn--primary" style={{ width: "100%" }}>
        {isRunning ? "Starting run..." : "Run agent"}
      </button>
    </form>
  );
}
