"use client";

import { useState, useMemo } from "react";
import { AppScaffold } from "../../components/app-scaffold";
import {
  Search,
  Plus,
  Star,
  Download,
  ExternalLink,
  Filter,
  ChevronDown,
  X,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type AgentStatus = "approved" | "pending" | "community" | "deprecated";

type MarketplaceAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: AgentStatus;
  owner: string;
  version: string;
  pricing: string;
  tools: string[];
  downloads: number;
  rating: number;
  lastUpdated: string;
  tags: string[];
};

const agents: MarketplaceAgent[] = [
  {
    id: "1",
    name: "Billing Reconcile Agent",
    slug: "billing-reconcile-agent",
    description: "Reconciles billing records against the ledger and flags mismatches automatically.",
    status: "approved",
    owner: "Finance Ops",
    version: "v3.2.0",
    pricing: "$0.01/task",
    tools: ["Stripe", "Ledger", "Email"],
    downloads: 1240,
    rating: 4.8,
    lastUpdated: "2026-06-15",
    tags: ["finance", "billing", "reconciliation"],
  },
  {
    id: "2",
    name: "Support Router Agent",
    slug: "support-router-agent",
    description: "Routes inbound support tickets to the right team based on context and urgency.",
    status: "approved",
    owner: "Support Platform",
    version: "v2.4.1",
    pricing: "Internal",
    tools: ["Zendesk", "Slack", "PagerDuty"],
    downloads: 890,
    rating: 4.6,
    lastUpdated: "2026-05-20",
    tags: ["support", "routing", "tickets"],
  },
  {
    id: "3",
    name: "Onboarding Assist Agent",
    slug: "onboarding-assist-agent",
    description: "Guides new users through workspace setup and initial configuration steps.",
    status: "pending",
    owner: "Customer Success",
    version: "draft",
    pricing: "Free",
    tools: ["Notion", "Email", "Calendar"],
    downloads: 0,
    rating: 0,
    lastUpdated: "2026-07-01",
    tags: ["onboarding", "setup", "guides"],
  },
  {
    id: "4",
    name: "Job Search Agent",
    slug: "job-search-agent",
    description: "Finds 2026 AI engineer roles, ranks matches, and drafts outreach messages.",
    status: "approved",
    owner: "Community",
    version: "v1.0.0",
    pricing: "Free",
    tools: ["LinkedIn", "Wellfound", "Greenhouse"],
    downloads: 3420,
    rating: 4.9,
    lastUpdated: "2026-06-28",
    tags: ["jobs", "recruiting", "ai-engineer"],
  },
  {
    id: "5",
    name: "Code Review Agent",
    slug: "code-review-agent",
    description: "Automated code review with security scanning and best practices enforcement.",
    status: "community",
    owner: "DevTools",
    version: "v0.9.0",
    pricing: "Free",
    tools: ["GitHub", "Snyk", "ESLint"],
    downloads: 560,
    rating: 4.3,
    lastUpdated: "2026-06-10",
    tags: ["code-review", "security", "github"],
  },
  {
    id: "6",
    name: "Meeting Prep Agent",
    slug: "meeting-prep-agent",
    description: "Prepares meeting briefs by gathering context from docs, CRM, and calendar.",
    status: "deprecated",
    owner: "Sales Ops",
    version: "v1.2.0",
    pricing: "Internal",
    tools: ["Calendar", "Notion", "Salesforce"],
    downloads: 210,
    rating: 3.8,
    lastUpdated: "2026-03-15",
    tags: ["meetings", "preparation", "crm"],
  },
];

const statusConfig: Record<AgentStatus, { label: string; className: string }> = {
  approved: { label: "Approved", className: "badge--success" },
  pending: { label: "Pending Review", className: "badge--warning" },
  community: { label: "Community", className: "badge--ion" },
  deprecated: { label: "Deprecated", className: "badge--default" },
};

const allTags = [...new Set(agents.flatMap((a) => a.tags))].sort();

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AgentStatus | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "updated">("rating");

  const filteredAgents = useMemo(() => {
    let result = [...agents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q)),
      );
    }

    if (selectedTag) {
      result = result.filter((a) => a.tags.includes(selectedTag));
    }

    if (selectedStatus) {
      result = result.filter((a) => a.status === selectedStatus);
    }

    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    return result;
  }, [searchQuery, selectedTag, selectedStatus, sortBy]);

  const stats = useMemo(() => ({
    total: agents.length,
    approved: agents.filter((a) => a.status === "approved").length,
    community: agents.filter((a) => a.status === "community").length,
    pending: agents.filter((a) => a.status === "pending").length,
  }), []);

  return (
    <AppScaffold active="Marketplace">
      <div className="page-header">
        <div className="page-header__eyebrow">Registry</div>
        <h1 className="page-header__title">Agent Marketplace</h1>
        <p className="page-header__subtitle">
          Discover, evaluate, and publish production AI agents.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        <div className="block stat-block">
          <div className="stat-block__label">Total Agents</div>
          <div className="stat-block__value">{stats.total}</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Approved</div>
          <div className="stat-block__value">{stats.approved}</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Community</div>
          <div className="stat-block__value">{stats.community}</div>
        </div>
        <div className="block stat-block">
          <div className="stat-block__label">Pending</div>
          <div className="stat-block__value">{stats.pending}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="block" style={{ marginBottom: "24px" }}>
        <div className="filter-bar">
          <div className="filter-bar__search">
            <div className="input-wrapper">
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search agents by name, description, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div className="filter-bar__controls">
            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus((e.target.value as AgentStatus) || null)}
              className="select"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="community">Community</option>
              <option value="pending">Pending</option>
              <option value="deprecated">Deprecated</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="select"
            >
              <option value="rating">Top Rated</option>
              <option value="downloads">Most Downloaded</option>
              <option value="updated">Recently Updated</option>
            </select>

            <button
              onClick={() => setShowPublishForm(true)}
              className="btn btn--primary"
            >
              <Plus size={16} />
              Publish Agent
            </button>
          </div>
        </div>

        {/* Tag filters */}
        <div className="tag-filters" style={{ marginTop: "16px" }}>
          {allTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`tag-chip ${selectedTag === tag ? "tag-chip--active" : ""}`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="tag-chip tag-chip--clear"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted">
          Showing {filteredAgents.length} of {agents.length} agents
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid--3" style={{ marginBottom: "32px" }}>
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="block block--interactive" style={{ display: "flex", flexDirection: "column" }}>
            <div className="flex justify-between items-start mb-3">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2">
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{agent.name}</div>
                </div>
                <div className="text-sm text-muted mt-1">
                  by {agent.owner} &middot; {agent.version}
                </div>
              </div>
              <span className={`badge ${statusConfig[agent.status].className}`}>
                {statusConfig[agent.status].label}
              </span>
            </div>

            <p className="block__description" style={{ flex: 1 }}>{agent.description}</p>

            {/* Tools */}
            <div className="flex flex-wrap gap-1 mt-3">
              {agent.tools.map((tool) => (
                <span key={tool} className="badge badge--default" style={{ fontSize: "11px" }}>
                  {tool}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex gap-3 text-sm text-muted">
                {agent.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {agent.rating}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Download size={12} /> {agent.downloads.toLocaleString()}
                </span>
              </div>
              <span className="badge badge--ion">{agent.pricing}</span>
            </div>

            {/* Tags */}
            <div className="card-tags">
              {agent.tags.map((tag) => (
                <span key={tag} className="card-tag">#{tag}</span>
              ))}
            </div>

            {/* Use Agent Button */}
            {agent.status === "approved" && (
              <Link
                href={`/marketplace/${agent.slug}`}
                className="btn btn--primary btn--full mt-3"
              >
                Use Agent
                <ArrowRight size={14} />
              </Link>
            )}
            {agent.status !== "approved" && (
              <div className="mt-3 text-sm text-muted" style={{ fontStyle: "italic" }}>
                {agent.status === "pending" ? "Pending approval" : agent.status === "deprecated" ? "Deprecated" : "Community - use at own risk"}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="block" style={{ textAlign: "center", padding: "48px" }}>
          <div className="text-muted">No agents match your search criteria.</div>
          <button
            onClick={() => { setSearchQuery(""); setSelectedTag(null); setSelectedStatus(null); }}
            className="btn btn--secondary mt-3"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishForm && (
        <div className="modal-overlay" onClick={() => setShowPublishForm(false)}>
          <div className="block modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Publish Agent</h2>
              <button onClick={() => setShowPublishForm(false)} className="btn btn--ghost btn--sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowPublishForm(false); }}>
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input type="text" className="input" placeholder="my-agent-name" required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input" rows={3} placeholder="What does this agent do?" required />
              </div>

              <div className="form-group">
                <label className="form-label">APL Contract (JSON)</label>
                <textarea className="input" rows={6} placeholder='{"name":"...","tools":[...]}' style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }} required />
              </div>

              <div className="grid grid--2" style={{ gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Version</label>
                  <input type="text" className="input" placeholder="v1.0.0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pricing</label>
                  <input type="text" className="input" placeholder="Free / $0.01/task" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input type="text" className="input" placeholder="finance, billing, automation" />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowPublishForm(false)} className="btn btn--secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Policy */}
      <div className="block">
        <div className="block__eyebrow">Policy</div>
        <div className="block__title">Governance & Access</div>
        <div className="block__description">
          All marketplace agents undergo governance review. Request approval before running paid or private agents.
          Community agents are unvetted — use at your own risk.
        </div>
      </div>
    </AppScaffold>
  );
}
