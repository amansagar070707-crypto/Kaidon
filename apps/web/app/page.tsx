import Link from "next/link";

const features = [
  {
    title: "Agent Builder",
    description: "Describe what you need. Kaidon generates the contract, assigns a runtime task, and validates the output.",
    href: "/studio",
    badge: "Studio",
  },
  {
    title: "Live Runtime",
    description: "Monitor agent execution with real-time traces, checkpoints, and progress updates.",
    href: "/runtime",
    badge: "Runtime",
  },
  {
    title: "Tool Registry",
    description: "Register and manage tools available to agents. MCP, HTTP, and built-in transports.",
    href: "/dashboard",
    badge: "Tools",
  },
  {
    title: "Memory & Context",
    description: "Workspace-scoped memory with compression, encryption, and retrieval policies.",
    href: "/dashboard",
    badge: "Memory",
  },
  {
    title: "OpenRouter First",
    description: "Open-source model defaults. Switch models without changing your agents.",
    href: "/sdk",
    badge: "LLM",
  },
  {
    title: "CLI Validation",
    description: "Validate agent contracts from the command line. CI-ready.",
    href: "/cli",
    badge: "CLI",
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
          <div style={{ marginBottom: "8px" }}>
            <span className="badge badge--accent">Open-source agent operating system</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: "24px" }}>
            Build and operate production AI agents
          </h1>
          <p style={{ fontSize: "18px", color: "var(--color-muted)", marginTop: "20px", lineHeight: 1.6, maxWidth: "48ch", marginLeft: "auto", marginRight: "auto" }}>
            Kaidon turns a plain-language request into a reusable agent, then shows the full runtime path, memory, tools, and execution trace.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "32px" }}>
            <Link href="/signup" className="btn btn--primary btn--lg">
              Create workspace
            </Link>
            <Link href="/studio" className="btn btn--secondary btn--lg">
              Open studio
            </Link>
          </div>
        </div>

        <div className="divider" style={{ marginTop: "64px" }} />

        <div className="grid grid--3" style={{ marginTop: "48px" }}>
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="block block--interactive" style={{ display: "grid", gap: "8px" }}>
              <div className="block__eyebrow">{feature.badge}</div>
              <div className="block__title">{feature.title}</div>
              <div className="block__description">{feature.description}</div>
            </Link>
          ))}
        </div>

        <div className="divider" style={{ marginTop: "48px" }} />

        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.03em" }}>
            One agent. One task. One visible trace.
          </h2>
          <p style={{ color: "var(--color-muted)", marginTop: "12px", maxWidth: "48ch", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            The runtime shows search, ranking, outreach, checkpoints, and memory updates as they happen. No black boxes.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
            <Link href="/runtime" className="btn btn--secondary">
              View live runtime
            </Link>
            <Link href="/marketplace" className="btn btn--ghost">
              Browse marketplace
            </Link>
          </div>
        </div>

        <footer style={{ marginTop: "80px", paddingTop: "24px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-muted)", fontSize: "13px" }}>
          <span>Kaidon Agent OS</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/runtime" className="nav-link">Runtime</Link>
            <Link href="/sdk" className="nav-link">SDK</Link>
            <Link href="/cli" className="nav-link">CLI</Link>
          </div>
        </footer>
      </main>
    </main>
  );
}
