import Link from "next/link";
import {
  Wand2,
  Activity,
  Wrench,
  Brain,
  Globe,
  Terminal,
  ArrowRight,
  Zap,
  Shield,
  Eye,
} from "lucide-react";

const features = [
  {
    title: "Agent Builder",
    description: "Describe what you need. Kaidon generates the contract, assigns a runtime task, and validates the output.",
    href: "/studio",
    icon: Wand2,
    badge: "Studio",
  },
  {
    title: "Live Runtime",
    description: "Monitor agent execution with real-time traces, checkpoints, and progress updates.",
    href: "/runtime",
    icon: Activity,
    badge: "Runtime",
  },
  {
    title: "Tool Registry",
    description: "Register and manage tools available to agents. MCP, HTTP, and built-in transports.",
    href: "/dashboard",
    icon: Wrench,
    badge: "Tools",
  },
  {
    title: "Memory & Context",
    description: "Workspace-scoped memory with compression, encryption, and retrieval policies.",
    href: "/dashboard",
    icon: Brain,
    badge: "Memory",
  },
  {
    title: "OpenRouter First",
    description: "Open-source model defaults. Switch models without changing your agents.",
    href: "/sdk",
    icon: Globe,
    badge: "LLM",
  },
  {
    title: "CLI Validation",
    description: "Validate agent contracts from the command line. CI-ready.",
    href: "/cli",
    icon: Terminal,
    badge: "CLI",
  },
] as const;

const principles = [
  {
    title: "No Black Boxes",
    description: "Every step is visible. Search, ranking, outreach, checkpoints, and memory updates as they happen.",
    icon: Eye,
  },
  {
    title: "Open Source Core",
    description: "Apache 2.0 licensed. Copy-paste primitives, not framework lock-in.",
    icon: Shield,
  },
  {
    title: "Production Ready",
    description: "Built for real workflows with retry, checkpoint, and resume capabilities.",
    icon: Zap,
  },
] as const;

export default function HomePage() {
  return (
    <main className="app-layout">
      <header className="app-layout__nav">
        <Link href="/" className="nav-brand">
          <img alt="Kaidon" src="/kaidon-logomark-dark.svg" />
          <span>Kaidon</span>
        </Link>
        <nav className="nav-links">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/runtime" className="nav-link">Runtime</Link>
          <Link href="/studio" className="nav-link">Studio</Link>
          <Link href="/login" className="nav-link">Log in</Link>
        </nav>
      </header>

      <main className="app-layout__main">
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: "var(--space-5)" }}>
            <span className="badge badge--accent">Open-source agent operating system</span>
          </div>
          <h1 className="page-header__title" style={{ marginTop: "var(--space-10)" }}>
            Build and operate production AI agents
          </h1>
          <p className="page-header__subtitle" style={{ margin: "var(--space-9) auto 0", textAlign: "center" }}>
            Kaidon turns a plain-language request into a reusable agent, then shows the full runtime path, memory, tools, and execution trace.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-6)", marginTop: "var(--space-11)" }}>
            <Link href="/signup" className="btn btn--primary btn--lg">
              Create workspace
              <ArrowRight size={16} />
            </Link>
            <Link href="/studio" className="btn btn--secondary btn--lg">
              Open studio
            </Link>
          </div>
        </div>

        <div className="divider" style={{ marginTop: "var(--space-14)" }} />

        <div className="grid grid--3" style={{ marginTop: "var(--space-13)" }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href} className="block block--interactive" style={{ display: "grid", gap: "var(--space-5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
                  <Icon size={16} className="text-muted" />
                  <div className="block__eyebrow">{feature.badge}</div>
                </div>
                <div className="block__title">{feature.title}</div>
                <div className="block__description">{feature.description}</div>
              </Link>
            );
          })}
        </div>

        <div className="divider" style={{ marginTop: "var(--space-13)" }} />

        <div style={{ marginTop: "var(--space-13)", textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--font-size-3xl, 24px)", fontWeight: 600, letterSpacing: "-0.03em" }}>
            One agent. One task. One visible trace.
          </h2>
          <p className="text-muted" style={{ marginTop: "var(--space-7)", maxWidth: "48ch", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            The runtime shows search, ranking, outreach, checkpoints, and memory updates as they happen.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-11)", marginTop: "var(--space-10)" }}>
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-5)", maxWidth: "200px" }}>
                  <Icon size={20} className="text-muted" />
                  <div className="font-semibold text-md">{principle.title}</div>
                  <div className="text-sm text-muted" style={{ lineHeight: 1.5 }}>{principle.description}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-6)", marginTop: "var(--space-10)" }}>
            <Link href="/runtime" className="btn btn--secondary">
              View live runtime
            </Link>
            <Link href="/marketplace" className="btn btn--ghost">
              Browse marketplace
            </Link>
          </div>
        </div>

        <footer style={{ marginTop: "var(--space-15)", paddingTop: "var(--space-10)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted-foreground)", fontSize: "var(--font-size-sm, 12px)" }}>
          <span>Kaidon Agent OS</span>
          <div style={{ display: "flex", gap: "var(--space-9)" }}>
            <Link href="/runtime" className="nav-link">Runtime</Link>
            <Link href="/sdk" className="nav-link">SDK</Link>
            <Link href="/cli" className="nav-link">CLI</Link>
          </div>
        </footer>
      </main>
    </main>
  );
}
