import Link from "next/link";

import { AppScaffold } from "../../components/app-scaffold";
import { getCurrentUser } from "../../lib/api/auth";
import { fetchHarnessList } from "../../lib/api/harness";
import { getProviderStatus } from "../../lib/state/provider";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const harness = await fetchHarnessList();
  const provider = await getProviderStatus();
  const user = await getCurrentUser();
  const latest = harness.latest;
  const items = harness.items;

  return (
    <AppScaffold active="Dashboard">
      <div className="page-header">
        <div className="page-header__eyebrow">{user?.workspace ?? "Workspace"}</div>
        <h1 className="page-header__title">{user ? `Welcome, ${user.name}` : "Dashboard"}</h1>
        <p className="page-header__subtitle">
          Monitor generated agents, runtime health, provider state, and recent activity.
        </p>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Harness Runs</div>
          <div className="stat-block__value">{items.length}</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Account</div>
          <div className="stat-block__value" style={{ fontSize: "16px" }}>
            {user ? user.name : "Guest"}
          </div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Provider</div>
          <div className="stat-block__value" style={{ fontSize: "16px" }}>
            {provider.model}
          </div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Latest Status</div>
          <div className="stat-block__value" style={{ fontSize: "16px" }}>
            {latest?.assignment.task.status ?? "none"}
          </div>
        </div>
      </div>

      <div className="block" style={{ marginBottom: "32px" }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="block__eyebrow">Quick start</div>
            <div className="block__title">Build an agent</div>
          </div>
          <Link href="/studio" className="btn btn--primary">
            Open Studio
          </Link>
        </div>
        <p className="block__description">
          Describe the agent you need. Kaidon generates the contract, assigns a runtime task, and validates the output.
        </p>
      </div>

      <div className="block" style={{ marginBottom: "32px" }}>
        <div className="block__eyebrow">Runtime</div>
        <div className="block__title">Recent activity</div>
        <div className="block__content">
          <div className="grid gap-4">
            {items.slice(0, 5).map((item) => (
              <div key={item.assignment.task.id} className="block block--interactive">
                <div className="flex justify-between items-center">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.assignment.generatedAgent.name}</div>
                    <div className="text-sm text-muted font-mono mt-2">{item.assignment.task.id}</div>
                  </div>
                  <span className="badge badge--success">{item.assignment.workItem.status}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/agents/${item.assignment.generatedAgent.id}`} className="btn btn--secondary btn--sm">
                    Open agent
                  </Link>
                  <Link href={`/runtime/${item.assignment.generatedAgent.id}/${item.assignment.task.id}`} className="btn btn--ghost btn--sm">
                    View trace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="block">
        <div className="block__eyebrow">Provider</div>
        <div className="block__title">OpenRouter readiness</div>
        <div className="grid grid--3 mt-4">
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Provider</div>
            <div className="font-mono mt-2">{provider.provider}</div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Model</div>
            <div className="font-mono mt-2">{provider.model}</div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Status</div>
            <div className="mt-2">
              <span className={`badge ${provider.configured ? "badge--success" : "badge--warning"}`}>
                {provider.configured ? "configured" : "no api key"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppScaffold>
  );
}
