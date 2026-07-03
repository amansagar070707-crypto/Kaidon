"use client";

import { useState, useTransition } from "react";

import { postHarnessAction } from "../lib/api/harness";

type RuntimeTaskActionsProps = {
  agentId: string;
  taskId: string;
  status: string;
};

export function RuntimeTaskActions({ agentId, taskId, status }: RuntimeTaskActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted">Current status:</span>
        <span className="badge badge--default">{status}</span>
      </div>
      <div className="flex gap-3">
        {(["checkpoint", "retry", "cancel"] as const).map((action) => (
          <button
            key={action}
            className={`btn ${action === "cancel" ? "btn--danger" : "btn--secondary"}`}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setMessage(null);
                const result = await postHarnessAction({ agentId, taskId, action });

                if (!result.item) {
                  setMessage(result.error ?? `Failed to ${action} task.`);
                  return;
                }

                setMessage(`Task ${action} applied.`);
                window.location.reload();
              })
            }
          >
            {isPending ? "Updating..." : action}
          </button>
        ))}
      </div>
      {message && (
        <div style={{ marginTop: "12px", padding: "10px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--color-muted)" }}>
          {message}
        </div>
      )}
    </div>
  );
}
