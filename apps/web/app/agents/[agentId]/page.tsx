import Link from "next/link";

import { AgentRunForm } from "../../../components/agent-run-form";
import { AppScaffold } from "../../../components/app-scaffold";
import { fetchHarnessList } from "../../../lib/api/harness";

type Params = {
  agentId: string;
};

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const harness = await fetchHarnessList();
  const entry = harness.items.find(
    (item) => item.assignment.generatedAgent.id === resolvedParams.agentId,
  );

  if (!entry) {
    return (
      <AppScaffold active="Studio">
        <div className="empty-state">
          <div className="empty-state__title">Agent not found</div>
          <p className="empty-state__description">
            Build an agent in Studio first, then open the generated agent cockpit.
          </p>
          <Link href="/studio" className="btn btn--primary">Open Studio</Link>
        </div>
      </AppScaffold>
    );
  }

  const { assignment, contextSnapshot, enabledTools } = entry;
  const agent = assignment.generatedAgent;
  const memory = agent.memory ?? {
    scope: "workspace",
    retentionDays: 30,
    encrypted: true,
  };
  const runtimeHref = `/runtime/${agent.id}/${assignment.task.id}`;

  return (
    <AppScaffold active="Studio">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="block__eyebrow">Generated agent</div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em" }}>
            {agent.name}
          </h1>
          <p className="block__description" style={{ maxWidth: "54ch" }}>
            {agent.description}
          </p>
          <div className="flex gap-2 mt-3">
            <span className="badge badge--success">{agent.status}</span>
            <span className="badge badge--accent">{agent.model.model}</span>
            <span className="badge badge--default">{memory.scope} memory</span>
          </div>
        </div>
        <Link href={runtimeHref} className="btn btn--primary">
          Open trace
        </Link>
      </div>

      <div className="grid grid--2" style={{ alignItems: "start", marginBottom: "32px" }}>
        <div className="block">
          <div className="block__eyebrow">Use agent</div>
          <div className="block__title">Give it a real task</div>
          <div className="block__description">
            Ask the agent to do something. Kaidon creates a runtime task and shows every step.
          </div>
          <div className="block__content">
            <AgentRunForm agentId={agent.id} agentName={agent.name} />
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">Execution flow</div>
          <div className="block__title">What happens after you run it</div>
          <div className="block__content">
            <div className="grid gap-3">
              {[
                { label: "User input", detail: "Find 2026 AI engineer jobs." },
                { label: "Planner", detail: "Break request into search, ranking, outreach, and tracking steps." },
                { label: "Tools", detail: enabledTools.map((tool) => tool.name).join(", ") || "Search, memory, browser tools." },
                { label: "Memory", detail: contextSnapshot.summary },
                { label: "Runtime", detail: "Checkpoint, retry, cancel, and event stream stay visible." },
              ].map((step, i) => (
                <div key={step.label} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: "12px", padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--color-accent)", color: "var(--color-base)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "13px" }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{step.label}</div>
                    <div className="text-sm text-muted mt-2">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="block" style={{ marginBottom: "32px" }}>
        <div className="block__eyebrow">Contract</div>
        <div className="block__title">Agent capabilities</div>
        <div className="grid grid--3 mt-4">
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Tools</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {agent.tools.map((tool) => (
                <span key={tool.id} className="badge badge--accent">{tool.name}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Memory</div>
            <div className="flex gap-2 mt-2">
              <span className="badge badge--default">{memory.scope}</span>
              <span className="badge badge--default">{memory.encrypted ? "encrypted" : "plain"}</span>
            </div>
            <div className="text-xs text-muted mt-2">Retention: {memory.retentionDays}d</div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Cockpit</div>
            <div className="font-mono mt-2 text-sm">/agents/{agent.id}</div>
          </div>
        </div>
      </div>

      <div className="block">
        <div className="block__eyebrow">History</div>
        <div className="block__title">Runs for this agent</div>
        <div className="block__content">
          <div className="grid gap-3">
            {harness.items.filter((item) => item.assignment.generatedAgent.id === agent.id).slice(0, 3).map((run) => (
              <Link
                key={run.assignment.task.id}
                href={`/runtime/${run.assignment.generatedAgent.id}/${run.assignment.task.id}`}
                className="block block--interactive"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div style={{ fontWeight: 600 }}>{run.assignment.task.status}</div>
                    <div className="text-sm text-muted mt-2">{run.research?.currentStep ?? "Waiting for data."}</div>
                  </div>
                  <span className="badge badge--success">{getRunProgress(run)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}

function getRunProgress(item: {
  research?: {
    progress?: number;
  };
}) {
  return typeof item.research?.progress === "number" ? item.research.progress : 0;
}
