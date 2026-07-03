import { Badge, Surface } from "../ui";
import { tokens } from "../../tokens";

export function MarketplaceHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={styles.header}>
      <div>
        <div style={styles.kicker}>Runtime</div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>
      <div style={styles.actions}>
        <input
          aria-label="Search agents"
          placeholder="Search agents..."
          style={styles.search}
        />
        <button style={styles.button}>+ New Agent</button>
      </div>
    </div>
  );
}

export function MarketplaceStatsStrip({
  stats,
}: {
  stats: { label: string; value: string }[];
}) {
  return (
    <div style={styles.grid}>
      {stats.map((stat) => (
        <Surface key={stat.label} style={styles.card}>
          <div style={styles.label}>{stat.label}</div>
          <div style={styles.value}>{stat.value}</div>
        </Surface>
      ))}
    </div>
  );
}

export function MarketplaceBadge({
  children,
}: {
  children: any;
}) {
  return <Badge tone="neutral">{children}</Badge>;
}

export function MarketplaceFilterBar() {
  return (
    <div style={styles.filters}>
      <input
        aria-label="Filter by domain"
        placeholder="Domain"
        style={styles.filterInput}
      />
      <input
        aria-label="Filter by status"
        placeholder="Status"
        style={styles.filterInput}
      />
      <input
        aria-label="Filter by pricing"
        placeholder="Pricing"
        style={styles.filterInput}
      />
    </div>
  );
}

export function AgentContractCard({
  title,
  owner,
  purpose,
  tools,
}: {
  title: string;
  owner: string;
  purpose: string;
  tools: string[];
}) {
  return (
    <Surface style={styles.contractCard}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.contractMeta}>Owner: {owner}</div>
      <p style={styles.contractPurpose}>{purpose}</p>
      <div style={styles.contractTools}>
        {tools.map((tool) => (
          <Badge key={tool}>{tool}</Badge>
        ))}
      </div>
    </Surface>
  );
}

export function ConversationLineagePanel({
  events,
}: {
  events: { id: string; label: string; time: string }[];
}) {
  return (
    <Surface style={styles.lineagePanel}>
      <div style={styles.sectionTitle}>Conversation Lineage</div>
      <div style={styles.lineageList}>
        {events.map((event) => (
          <div key={event.id} style={styles.lineageRow}>
            <div style={styles.lineageLabel}>{event.label}</div>
            <div style={styles.lineageMeta}>
              <span>{event.id}</span>
              <span>{event.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function PricingBadge({ label }: { label: string }) {
  return <Badge tone="accent">{label}</Badge>;
}

export function GovernanceBadge({ label }: { label: string }) {
  return <Badge tone="ion">{label}</Badge>;
}

export function ApprovalStatusPill({
  label,
}: {
  label: string;
}) {
  return <Badge tone="neutral">{label}</Badge>;
}

export function CommercePanel({
  pricing,
  access,
}: {
  pricing: string;
  access: string;
}) {
  return (
    <Surface style={styles.commerceCard}>
      <div style={styles.sectionTitle}>Commerce</div>
      <div style={styles.contractMeta}>{pricing}</div>
      <div style={styles.contractMeta}>{access}</div>
    </Surface>
  );
}

export function RequestAccessBanner({ message }: { message: string }) {
  return <Surface style={styles.requestBanner}>{message}</Surface>;
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "24px",
  },
  kicker: {
    color: tokens.color.muted,
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: "4px",
  },
  title: {
    fontSize: "32px",
    margin: 0,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    marginTop: "8px",
    color: tokens.color.muted,
  },
  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  search: {
    background: tokens.color.panel,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    color: tokens.color.text,
    padding: "12px 14px",
    minWidth: "280px",
  },
  button: {
    background: tokens.color.accent,
    color: tokens.color.base,
    border: 0,
    borderRadius: tokens.radius.md,
    padding: "12px 16px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  filterInput: {
    background: tokens.color.panel,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    color: tokens.color.text,
    padding: "12px 14px",
  },
  card: {
    padding: "16px",
  },
  label: {
    color: tokens.color.muted,
    fontSize: "12px",
  },
  value: {
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "8px",
  },
  contractCard: {
    padding: "18px",
  },
  contractMeta: {
    color: tokens.color.muted,
    fontSize: "13px",
    marginBottom: "8px",
  },
  contractPurpose: {
    color: tokens.color.text,
    lineHeight: 1.5,
  },
  contractTools: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  lineagePanel: {
    padding: "18px",
  },
  lineageList: {
    display: "grid",
    gap: "12px",
  },
  lineageRow: {
    display: "grid",
    gap: "4px",
    padding: "12px",
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.base,
  },
  lineageLabel: {
    color: tokens.color.text,
  },
  lineageMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontFamily: 'JetBrains Mono, "SFMono-Regular", Consolas, monospace',
    color: tokens.color.muted,
    fontSize: "12px",
  },
  sectionTitle: {
    marginBottom: "14px",
    fontSize: "18px",
    fontWeight: 700,
  },
  requestBanner: {
    padding: "18px",
    background: "rgba(245, 166, 35, 0.08)",
  },
  commerceCard: {
    padding: "18px",
  },
} as const;
