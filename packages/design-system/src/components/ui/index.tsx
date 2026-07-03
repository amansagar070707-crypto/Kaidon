import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import { tokens } from "../../tokens";

type SurfaceProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function Button({
  children,
  variant = "accent",
  ...props
}: {
  children: ReactNode;
  variant?: "accent" | "ghost";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button style={buttonStyles[variant]} {...props}>
      {children}
    </button>
  );
}

export function Surface({ children, style }: SurfaceProps) {
  return <div style={{ ...surfaceStyles.base, ...style }}>{children}</div>;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "ion";
}) {
  return <span style={badgeStyles[tone]}>{children}</span>;
}

const surfaceStyles = {
  base: {
    background: tokens.color.panel,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.lg,
    color: tokens.color.text,
  },
} as const;

const buttonStyles = {
  accent: {
    background: tokens.color.accent,
    color: tokens.color.base,
    border: 0,
    borderRadius: tokens.radius.md,
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  ghost: {
    background: tokens.color.panel,
    color: tokens.color.text,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    padding: "12px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
} as const;

const badgeStyles = {
  neutral: {
    background: tokens.color.border,
    color: tokens.color.muted,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
  },
  accent: {
    background: "rgba(245, 166, 35, 0.12)",
    color: tokens.color.accent,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
  },
  ion: {
    background: "rgba(110, 123, 255, 0.12)",
    color: tokens.color.ion,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
  },
} as const;
