import { tokens } from "../../tokens";

export function StatusPill({
  status,
}: {
  status: "running" | "idle" | "failed" | "deploying" | "waiting";
}) {
  return <span style={statusStyles[status]}>{status}</span>;
}

const statusStyles = {
  running: badge(tokens.color.accent, "rgba(245, 166, 35, 0.12)"),
  idle: badge(tokens.color.muted, tokens.color.border),
  failed: badge(tokens.color.ion, "rgba(110, 123, 255, 0.12)"),
  deploying: badge(tokens.color.accent, "rgba(245, 166, 35, 0.12)"),
  waiting: badge(tokens.color.text, tokens.color.border),
} as const;

function badge(fg: string, bg: string) {
  return {
    alignSelf: "start",
    padding: "7px 10px",
    borderRadius: 999,
    background: bg,
    color: fg,
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    textTransform: "capitalize" as const,
  };
}
