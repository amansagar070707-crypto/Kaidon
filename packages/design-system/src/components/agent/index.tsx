import { Badge, Surface } from "../ui";
import { StatusPill } from "../feedback";
import { tokens } from "../../tokens";

export function AgentCard({
  name,
  status,
  description,
  lastRun,
  version,
}: {
  name: string;
  status: "running" | "idle" | "failed" | "deploying" | "waiting";
  description: string;
  lastRun: string;
  version: string;
}) {
  return (
    <Surface style={cardStyles.card}>
      <div style={cardStyles.header}>
        <div>
          <h2 style={cardStyles.title}>{name}</h2>
          <p style={cardStyles.description}>{description}</p>
        </div>
        <StatusPill status={status} />
      </div>
      <div style={cardStyles.footer}>
        <Badge>{version}</Badge>
        <span style={cardStyles.meta}>{lastRun}</span>
      </div>
    </Surface>
  );
}

export function LiveRunTimeline({
  steps,
}: {
  steps: {
    id: string;
    label: string;
    time: string;
    detail: string;
    tone?: "neutral" | "accent" | "ion";
  }[];
}) {
  return (
    <Surface style={cardStyles.timeline}>
      <div style={cardStyles.sectionLabel}>Live run timeline</div>
      <div style={cardStyles.timelineList}>
        {steps.map((step) => (
          <div key={step.id} style={cardStyles.timelineRow}>
            <div style={cardStyles.timelineTop}>
              <Badge tone={step.tone ?? "neutral"}>{step.label}</Badge>
              <span style={cardStyles.meta}>{step.time}</span>
            </div>
            <div style={cardStyles.timelineDetail}>{step.detail}</div>
            <div style={cardStyles.timelineId}>{step.id}</div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function TraceStepCard({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: string;
}) {
  return (
    <Surface style={cardStyles.traceCard}>
      <div style={cardStyles.timelineTop}>
        <div style={cardStyles.traceTitle}>{title}</div>
        <Badge tone="ion">{status}</Badge>
      </div>
      <div style={cardStyles.timelineDetail}>{detail}</div>
    </Surface>
  );
}

const cardStyles = {
  card: {
    padding: "18px 18px 16px",
    minHeight: "160px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.2,
    letterSpacing: "-0.025em",
    color: tokens.color.text,
  },
  description: {
    marginTop: "12px",
    color: tokens.color.muted,
    lineHeight: 1.5,
    maxWidth: "54ch",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    alignItems: "center",
  },
  meta: {
    color: tokens.color.muted,
    fontSize: "12px",
    fontFamily: 'JetBrains Mono, "SFMono-Regular", Consolas, monospace',
  },
  timeline: {
    padding: "18px",
  },
  sectionLabel: {
    marginBottom: "14px",
    fontSize: "18px",
    fontWeight: 700,
  },
  timelineList: {
    display: "grid",
    gap: "12px",
  },
  timelineRow: {
    padding: "14px",
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    background: tokens.color.base,
  },
  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  timelineDetail: {
    color: tokens.color.text,
    lineHeight: 1.5,
  },
  timelineId: {
    marginTop: "10px",
    color: tokens.color.muted,
    fontSize: "12px",
    fontFamily: 'JetBrains Mono, "SFMono-Regular", Consolas, monospace',
  },
  traceCard: {
    padding: "18px",
  },
  traceTitle: {
    fontWeight: 700,
  },
} as const;
