import Link from "next/link";

import { AppScaffold } from "../../components/app-scaffold";
import { RuntimeTaskActions } from "../../components/runtime-task-actions";
import { fetchHarnessList } from "../../lib/api/harness";
import { getProviderStatus } from "../../lib/state/provider";

export const dynamic = "force-dynamic";

export default async function RuntimePage() {
  const harness = await fetchHarnessList();
  const provider = await getProviderStatus();

  if (!harness.latest) {
    return (
      <AppScaffold active="Runtime">
        <div className="page-header">
          <div className="page-header__eyebrow">Runtime</div>
          <h1 className="page-header__title">Runtime unavailable</h1>
          <p className="page-header__subtitle">
            {harness.error ?? "No harness data returned. Start the backend server."}
          </p>
        </div>
      </AppScaffold>
    );
  }

  const entry = harness.latest;
  const items = harness.items;
  const latestRuns = getLatestRunsPerAgent(items);
  const {
    assignment,
    enabledTools,
    contextSnapshot,
    visibleContextTokens,
  } = entry;

  return (
    <AppScaffold active="Runtime">
      <div className="page-header">
        <div className="page-header__eyebrow">Runtime</div>
        <h1 className="page-header__title">Live run</h1>
        <p className="page-header__subtitle">
          Monitor agent execution with real-time traces, checkpoints, and progress updates.
        </p>
      </div>

      <div className="grid grid--3" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Agent</div>
          <div className="stat-block__value" style={{ fontSize: "18px", marginTop: "8px" }}>
            {assignment.generatedAgent.name}
          </div>
          <div className="flex gap-2 mt-2">
            <span className="badge badge--success">{assignment.generatedAgent.status}</span>
            <span className="badge badge--default">{assignment.generatedAgent.version}</span>
          </div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Task Status</div>
          <div className="stat-block__value" style={{ fontSize: "18px", marginTop: "8px" }}>
            {assignment.task.status}
          </div>
          <div className="text-sm text-muted mt-2">
            {assignment.task.events.length} events
          </div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Provider</div>
          <div className="stat-block__value" style={{ fontSize: "18px", marginTop: "8px" }}>
            {provider.model}
          </div>
          <div className="flex gap-2 mt-2">
            <span className={`badge ${provider.configured ? "badge--success" : "badge--warning"}`}>
              {provider.configured ? "configured" : "no api key"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid--2" style={{ alignItems: "start", marginBottom: "32px" }}>
        <div className="block">
          <div className="block__eyebrow">Agent Definition</div>
          <div className="block__title">{assignment.generatedAgent.name}</div>
          <div className="block__description">
            {assignment.generatedAgent.description}
          </div>
          <div className="block__content">
            <div className="code-block">{JSON.stringify({
              id: assignment.generatedAgent.id,
              model: assignment.generatedAgent.model.model,
              tools: assignment.generatedAgent.tools.map(t => t.name),
              memory: assignment.generatedAgent.memory,
            }, null, 2)}</div>
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">Context & Memory</div>
          <div className="block__title">Workspace context</div>
          <div className="block__description">
            {visibleContextTokens} visible tokens &middot; {contextSnapshot.items.length} items
          </div>
          <div className="block__content">
            <div className="timeline">
              {contextSnapshot.items.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: item.scope === "workspace" ? "var(--color-accent)" : "var(--color-ion)" }} />
                  <div className="timeline-content">
                    <div className="timeline-title">{item.content}</div>
                    <div className="timeline-meta">{item.scope} &middot; {item.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid--2" style={{ alignItems: "start", marginBottom: "32px" }}>
        <div className="block">
          <div className="block__eyebrow">Tools</div>
          <div className="block__title">Registered tools</div>
          <div className="block__content">
            <div className="grid gap-3">
              {enabledTools.map((tool) => (
                <div key={tool.id} style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 600 }}>{tool.name}</span>
                    <span className="badge badge--default">{tool.transport}</span>
                  </div>
                  <div className="text-sm text-muted mt-2">{tool.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">Actions</div>
          <div className="block__title">Task controls</div>
          <div className="block__description">
            Checkpoint, retry, or cancel the current run.
          </div>
          <div className="block__content">
            <RuntimeTaskActions
              agentId={assignment.generatedAgent.id}
              taskId={assignment.task.id}
              status={assignment.task.status}
            />
          </div>
        </div>
      </div>

      <div className="block" style={{ marginBottom: "32px" }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="block__eyebrow">Runs</div>
            <div className="block__title">Latest run per agent</div>
          </div>
          <Link href={`/runtime/${assignment.generatedAgent.id}/${assignment.task.id}`} className="btn btn--secondary btn--sm">
            Open detail
          </Link>
        </div>

        <div className="grid gap-4">
          {latestRuns.map((item) => (
            <Link
              key={item.assignment.task.id}
              href={`/runtime/${item.assignment.generatedAgent.id}/${item.assignment.task.id}`}
              className="block block--interactive"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div style={{ fontWeight: 600 }}>{item.assignment.generatedAgent.name}</div>
                  <div className="text-sm text-muted mt-2 font-mono">
                    {item.assignment.task.id}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge--warning">{getRunProgress(item)}%</span>
                  <span className="badge badge--success">{item.assignment.task.status}</span>
                </div>
              </div>
              <div className="progress mt-3">
                <div className="progress__fill" style={{ width: `${getRunProgress(item)}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="block">
        <div className="block__eyebrow">Events</div>
        <div className="block__title">Recent runtime events</div>
        <div className="block__content">
          <div className="timeline">
            {getTaskEvents(entry).slice(-5).reverse().map((event, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">{event.message}</div>
                  <div className="timeline-meta">{event.type} &middot; {formatRelativeTime(event.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}

function getLatestRunsPerAgent<T extends { assignment: { generatedAgent: { id: string } } }>(items: T[]) {
  const seen = new Set<string>();
  const latest: T[] = [];

  for (const item of items) {
    const agentId = item.assignment.generatedAgent.id;

    if (seen.has(agentId)) {
      continue;
    }

    seen.add(agentId);
    latest.push(item);
  }

  return latest;
}

function formatRelativeTime(isoTimestamp: string) {
  const timestamp = new Date(isoTimestamp).getTime();
  const deltaSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));

  if (deltaSeconds < 60) {
    return `${deltaSeconds}s ago`;
  }

  const deltaMinutes = Math.round(deltaSeconds / 60);

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  return `${deltaHours}h ago`;
}

function getRunProgress(item: {
  research?: {
    progress?: number;
  };
}) {
  return typeof item.research?.progress === "number" ? item.research.progress : 0;
}

function getTaskEvents(item: {
  assignment?: {
    task?: {
      events?: Array<{
        type: string;
        at: string;
        message: string;
      }>;
    };
  };
}) {
  return item.assignment?.task?.events ?? [];
}
