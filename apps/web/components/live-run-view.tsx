"use client";

import { useEffect, useState } from "react";

import type { HarnessViewModel } from "../lib/state/harness";

type LiveRunViewProps = {
  agentId: string;
  taskId: string;
  initialItem: HarnessViewModel;
  model: string;
};

type StreamPayload = {
  item: HarnessViewModel | null;
};

export function LiveRunView({ agentId, taskId, initialItem, model }: LiveRunViewProps) {
  const [item, setItem] = useState(initialItem);
  const [streamState, setStreamState] = useState<"connecting" | "live" | "closed">("connecting");

  useEffect(() => {
    const stream = new EventSource(
      `/api/harness/stream?agentId=${encodeURIComponent(agentId)}&taskId=${encodeURIComponent(taskId)}`,
    );

    const handleSnapshot = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as StreamPayload;

      if (payload.item) {
        setItem(payload.item);
      }

      setStreamState("live");
    };

    stream.addEventListener("snapshot", handleSnapshot);
    stream.addEventListener("complete", handleSnapshot);
    stream.onerror = () => {
      setStreamState("closed");
      stream.close();
    };

    return () => {
      stream.close();
    };
  }, [agentId, taskId]);

  const research = item.research ?? createFallbackResearch(item);
  const timeline = item.timeline ?? createFallbackTimeline(item);
  const task = item.assignment?.task ?? createFallbackTask();
  const status = task.status;

  return (
    <main style={{ display: "grid", gap: "16px" }}>
      <div className="block">
        <div className="flex justify-between items-center mb-4">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: streamState === "live" ? "var(--color-success)" : "var(--color-muted)" }} />
            <span className="badge badge--default">{streamState === "live" ? status : "connecting"}</span>
          </span>
          <span className="text-sm font-mono text-muted">{model}</span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "8px" }}>
          {research.query}
        </h1>
        <p className="text-muted" style={{ maxWidth: "54ch", lineHeight: 1.6 }}>
          Live backend events. Search results and progress update in real-time.
        </p>

        <div className="flex justify-between items-center mt-6 mb-2">
          <span style={{ fontWeight: 500 }}>{status === "succeeded" ? "Finished" : "Researching"}</span>
          <span className="font-mono" style={{ color: "var(--color-accent)" }}>{research.progress}%</span>
        </div>
        <div className="progress">
          <div className="progress__fill" style={{ width: `${research.progress}%` }} />
        </div>

        <div className="mt-4">
          <span className="text-sm text-muted">Now: </span>
          <span className="text-sm">{research.currentStep}</span>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span>{research.completedSteps} of {research.totalSteps} steps</span>
          <span>{timeline.remainingSteps} steps left</span>
          <span>{streamState === "live" ? "stream live" : "stream paused"}</span>
        </div>

        <div className="mt-6">
          {timeline.phases.map((phase) => (
            <div key={phase.id} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: "12px", padding: "10px 0", borderTop: "1px solid var(--color-border)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)", marginTop: "4px", opacity: phase.status === "pending" ? 0.35 : 1 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{phase.label}</div>
                <div className="text-sm text-muted">{phase.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="block">
        <div className="block__eyebrow">Results</div>
        <div className="block__title">What the run has found</div>
        {research.results.length === 0 ? (
          <div className="mt-4" style={{ padding: "16px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-muted)", fontSize: "14px" }}>
            No results collected yet. They will appear as the stream progresses.
          </div>
        ) : (
          <div className="grid gap-3 mt-4">
            {research.results.map((result) => (
              <a key={result.url} href={result.url} target="_blank" rel="noreferrer" className="block block--interactive" style={{ display: "grid", gap: "4px" }}>
                <div className="text-xs text-muted uppercase">{result.source}</div>
                <div style={{ fontWeight: 600 }}>{result.title}</div>
                <div className="text-sm text-muted">{result.snippet}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="block">
        <div className="block__eyebrow">Feed</div>
        <div className="block__title">Runtime events</div>
        <div className="block__content">
          <div className="timeline">
            {getTaskEvents(task).slice().reverse().slice(0, 6).map((event, i) => (
              <div key={`${event.type}-${event.at}-${i}`} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">{event.message}</div>
                  <div className="timeline-meta">{humanizeEventType(event.type)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function createFallbackResearch(item: HarnessViewModel) {
  const task = item.assignment?.task;

  return {
    query: task?.input?.prompt ? String(task.input.prompt) : "Live run",
    status: task?.status ?? "queued",
    progress: 0,
    completedSteps: 0,
    totalSteps: 0,
    currentStep: "Waiting for live run data.",
    sources: [],
    results: [],
    lastUpdatedAt: task?.updatedAt ?? new Date().toISOString(),
  };
}

function createFallbackTask() {
  return {
    status: "queued",
    events: [],
  } as const;
}

function createFallbackTimeline(item: HarnessViewModel) {
  return {
    query: item.research?.query ?? "Live run",
    stage: "Execution",
    progress: item.research?.progress ?? 0,
    remainingSteps: 5,
    phases: [
      { id: "discover", label: "Discover", status: "complete", hint: "Clarify request and constraints." },
      { id: "search", label: "Search", status: "active", hint: "Check approved sources." },
      { id: "rank", label: "Rank", status: "pending", hint: "Compare matches and trade-offs." },
      { id: "draft", label: "Draft", status: "pending", hint: "Prepare output for the user." },
      { id: "track", label: "Track", status: "pending", hint: "Persist the result for follow-up." },
    ],
    events: [],
    lastUpdatedAt: item.assignment?.task?.updatedAt ?? new Date().toISOString(),
  };
}

function getTaskEvents(task: {
  events?: Array<{
    type: string;
    at: string;
    message: string;
  }>;
}) {
  return task.events ?? [];
}

function humanizeEventType(type: string) {
  return type
    .replace(/\./g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
