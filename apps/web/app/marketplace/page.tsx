import { AppScaffold } from "../../components/app-scaffold";

const marketplaceAgents = [
  {
    name: "billing-reconcile-agent",
    status: "approved",
    owner: "Finance Ops",
    version: "v3.2.0",
    pricing: "Usage: $0.01 per task",
    tools: ["Stripe", "Ledger", "Email"],
    purpose: "Reconciles billing records against the ledger and flags mismatches.",
  },
  {
    name: "support-router-agent",
    status: "request only",
    owner: "Support Platform",
    version: "v2.4.1",
    pricing: "Subscription: internal only",
    tools: ["Zendesk", "Slack", "PagerDuty"],
    purpose: "Routes inbound support tickets to the right team based on context.",
  },
  {
    name: "onboarding-assist-agent",
    status: "pending review",
    owner: "Customer Success",
    version: "draft",
    pricing: "Free tier available",
    tools: ["Notion", "Email", "Calendar"],
    purpose: "Guides new users through workspace setup and initial configuration.",
  },
];

export default function MarketplacePage() {
  return (
    <AppScaffold active="Marketplace">
      <div className="page-header">
        <div className="page-header__eyebrow">Marketplace</div>
        <h1 className="page-header__title">Agent Marketplace</h1>
        <p className="page-header__subtitle">
          Governed agent discovery, evaluation, and secure consumption.
        </p>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Registered</div>
          <div className="stat-block__value">18</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Approved</div>
          <div className="stat-block__value">11</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Private</div>
          <div className="stat-block__value">4</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Pending</div>
          <div className="stat-block__value">3</div>
        </div>
      </div>

      <div className="grid grid--3" style={{ marginBottom: "32px" }}>
        {marketplaceAgents.map((agent) => (
          <div key={agent.name} className="block block--interactive">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div style={{ fontWeight: 600 }}>{agent.name}</div>
                <div className="text-sm text-muted mt-2">{agent.owner}</div>
              </div>
              <span className={`badge ${agent.status === "approved" ? "badge--success" : agent.status === "request only" ? "badge--warning" : "badge--default"}`}>
                {agent.status}
              </span>
            </div>
            <p className="block__description">{agent.purpose}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge--default">{agent.version}</span>
              <span className="badge badge--accent">{agent.pricing}</span>
              <span className="badge badge--ion">Governed</span>
            </div>
          </div>
        ))}
      </div>

      <div className="block">
        <div className="block__eyebrow">Notice</div>
        <div className="block__title">Access policy</div>
        <div className="block__description">
          Request approval before running paid or private agents. All marketplace agents go through governance review.
        </div>
      </div>
    </AppScaffold>
  );
}
