import type { ReactNode } from "react";
import Link from "next/link";

import { AppShell } from "@kaidon/design-system";

type AppScaffoldProps = {
  active: "Home" | "Dashboard" | "Runtime" | "SDK" | "CLI" | "Studio" | "Cloud" | "Marketplace" | "Profile";
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Runtime", href: "/runtime" },
  { label: "Studio", href: "/studio" },
  { label: "Marketplace", href: "/marketplace" },
] as const;

export function AppScaffold({ active, children }: AppScaffoldProps) {
  return (
    <AppShell
      nav={
        <>
          <Link href="/" className="nav-brand">
            <img alt="Kaidon" src="/kaidon-logomark-dark.svg" />
            <span>Kaidon</span>
          </Link>
          <nav className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link ${item.label === active ? "nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/profile" className="nav-link">
              Profile
            </Link>
          </nav>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
