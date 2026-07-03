import { tokens } from "../../tokens";

type NavItem = string | { label: string; href: string };

export function SidebarNav({
  active,
  items,
}: {
  active: string;
  items: NavItem[];
}) {
  return (
    <nav style={navStyles.nav}>
      {items.map((item) => {
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? "#" : item.href;

        return (
          <a
            key={label}
            href={href}
            style={label === active ? navStyles.active : navStyles.item}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}

const navStyles = {
  nav: {
    display: "grid",
    gap: "6px",
    padding: "0 14px 24px",
  },
  item: {
    display: "block",
    padding: "11px 14px",
    color: tokens.color.muted,
    borderRadius: tokens.radius.md,
    fontSize: "15px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    border: "1px solid transparent",
    transition: "background 140ms ease, border-color 140ms ease, color 140ms ease",
  },
  active: {
    display: "block",
    padding: "11px 14px",
    color: tokens.color.text,
    background: "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    boxShadow: "inset 2px 0 0 #F5A623",
  },
} as const;
