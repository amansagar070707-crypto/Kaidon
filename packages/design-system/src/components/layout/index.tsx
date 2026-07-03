import type { ReactNode } from "react";

export function AppShell({
  nav,
  children,
}: {
  nav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="app-layout">
      {nav && <header className="app-layout__nav">{nav}</header>}
      <main className="app-layout__main">{children}</main>
    </div>
  );
}
