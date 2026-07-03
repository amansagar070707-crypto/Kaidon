import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Activity,
  Wand2,
  Store,
  User,
} from "lucide-react";

import { AppShell } from "@kaidon/design-system";

type AppScaffoldProps = {
  active: "Home" | "Dashboard" | "Runtime" | "SDK" | "CLI" | "Studio" | "Cloud" | "Marketplace" | "Profile";
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Runtime", href: "/runtime", icon: Activity },
  { label: "Studio", href: "/studio", icon: Wand2 },
  { label: "Marketplace", href: "/marketplace", icon: Store },
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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-link ${item.label === active ? "nav-link--active" : ""}`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/profile"
              className={`nav-link ${"Profile" === active ? "nav-link--active" : ""}`}
            >
              <User size={14} />
              <span>Profile</span>
            </Link>
          </nav>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
