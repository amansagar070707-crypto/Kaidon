import Link from "next/link";

import { AppScaffold } from "../../../../components/app-scaffold";
import { LiveRunView } from "../../../../components/live-run-view";
import { RuntimeTaskActions } from "../../../../components/runtime-task-actions";
import { fetchHarnessItem } from "../../../../lib/api/harness";
import { getProviderStatus } from "../../../../lib/state/provider";

type Params = {
  agentId: string;
  taskId: string;
};

export const dynamic = "force-dynamic";

export default async function RuntimeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const resolvedParams = await params;
  const provider = await getProviderStatus();
  const harness = await fetchHarnessItem(resolvedParams.agentId, resolvedParams.taskId);
  const entry = harness.item;

  if (!entry) {
    return (
      <AppScaffold active="Runtime">
        <div className="empty-state">
          <div className="empty-state__title">Run unavailable</div>
          <p className="empty-state__description">{harness.error ?? "No run matched this agent/task pair."}</p>
          <Link href="/runtime" className="btn btn--secondary">Back to runtime</Link>
        </div>
      </AppScaffold>
    );
  }

  const agent = entry.assignment.generatedAgent;
  const task = entry.assignment.task;

  return (
    <AppScaffold active="Runtime">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="block__eyebrow">Live run</div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            {agent.name}
          </h1>
        </div>
        <Link href="/runtime" className="btn btn--secondary btn--sm">
          Back
        </Link>
      </div>

      <LiveRunView agentId={agent.id} taskId={task.id} initialItem={entry} model={provider.model} />

      <div className="block mt-4">
        <div className="block__eyebrow">Timeline</div>
        <div className="block__title">Execution phases</div>
        <div className="block__content">
          <div className="timeline">
            {entry.timeline?.phases?.map((phase) => (
              <div key={phase.id} className="timeline-item">
                <div className="timeline-dot" style={{ background: phase.status === "complete" ? "var(--color-success)" : phase.status === "active" ? "var(--color-accent)" : "var(--color-muted)" }} />
                <div className="timeline-content">
                  <div className="timeline-title">{phase.label}</div>
                  <div className="timeline-meta">{phase.hint}</div>
                </div>
                <span className={`badge ${phase.status === "complete" ? "badge--success" : phase.status === "active" ? "badge--accent" : "badge--default"}`}>
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="block mt-4">
        <div className="block__eyebrow">Actions</div>
        <div className="block__title">Run controls</div>
        <div className="block__content">
          <RuntimeTaskActions agentId={agent.id} taskId={task.id} status={task.status} />
        </div>
      </div>

      <details className="block mt-4">
        <summary style={{ cursor: "pointer", fontWeight: 600, listStyle: "none" }}>
          Show technical trace
        </summary>
        <div className="block__content">
          <div className="timeline">
            {getTaskEvents(task).map((event, i) => (
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
      </details>
    </AppScaffold>
  );
}

function humanizeEventType(type: string) {
  return type
    .replace(/\./g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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
