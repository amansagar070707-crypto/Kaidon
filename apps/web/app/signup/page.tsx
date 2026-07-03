import Link from "next/link";

import { AuthForm } from "../../components/auth-form";

export default function SignupPage() {
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
            Create your workspace
          </h1>
          <p className="block__description">
            Register a team workspace and start generating governed automation runs.
          </p>
          <div className="block__content">
            <AuthForm mode="signup" />
            <p className="text-sm text-muted mt-4">
              Already registered? <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Log in</Link>
            </p>
          </div>
        </div>
      </main>
    </main>
  );
}
