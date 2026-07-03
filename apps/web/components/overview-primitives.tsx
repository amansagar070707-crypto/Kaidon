import type { ReactNode } from "react";

export function OverviewSection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: "32px" }}>
      {eyebrow && <div className="block__eyebrow">{eyebrow}</div>}
      <h2 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "16px" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function OverviewGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid--3">{children}</div>;
}

export function OverviewCard({
  title,
  description,
  meta,
  badges,
}: {
  title: string;
  description: string;
  meta?: string;
  badges?: string[];
}) {
  return (
    <div className="block">
      <h3 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h3>
      <p className="block__description">{description}</p>
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {badges.map((badge) => (
            <span key={badge} className="badge badge--default">{badge}</span>
          ))}
        </div>
      )}
      {meta && (
        <div className="text-xs text-muted font-mono mt-3">{meta}</div>
      )}
    </div>
  );
}
