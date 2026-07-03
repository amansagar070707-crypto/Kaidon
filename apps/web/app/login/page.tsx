import Link from "next/link";

import { AuthForm } from "../../components/auth-form";

export default function LoginPage() {
  return (
    <main className="app-layout">
      <header className="app-layout__nav">
        <Link href="/" className="nav-brand">
          <img alt="Kaidon" src="/kaidon-logomark-dark.svg" />
          <span>Kaidon</span>
        </Link>
      </header>

      <main className="app-layout__main" style={{ display: "grid", placeItems: "center" }}>
        <div className="block" style={{ width: "100%", maxWidth: "440px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Log in to Kaidon
          </h1>
          <p className="block__description">
            Access your workspace runtime, generated agents, and profile settings.
          </p>
          <div className="block__content">
            <AuthForm mode="login" />
            <p className="text-sm text-muted mt-4">
              New workspace? <Link href="/signup" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </main>
  );
}
