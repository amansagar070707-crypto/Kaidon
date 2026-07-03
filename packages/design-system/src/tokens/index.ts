export const tokens = {
  color: {
    // Base
    base: "#000000",
    panel: "#0a0a0a",
    surface: "#111111",
    border: "#222222",

    // Text
    text: "#ededed",
    textSecondary: "#afafaf",
    textTertiary: "#cdcdcd",
    muted: "#888888",

    // Accent
    accent: "#0070f3",
    ion: "#7928ca",

    // Semantic
    success: "#50e3c2",
    warning: "#f5a623",
    danger: "#ee0000",

    // Reasoning / Tool
    reasoning: "#7928ca",
    toolExecution: "#00bcd4",
  },
  font: {
    family: {
      primary: "Geist, -apple-system-body, ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Arial, sans-serif",
      mono: "Geist Mono, SF Mono, Fira Code, Fira Mono, Menlo, Consolas, monospace",
    },
    size: {
      xs: "11px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "18px",
      "2xl": "20px",
      "3xl": "24px",
      hero: "clamp(32px, 5vw, 56px)",
      section: "clamp(24px, 3vw, 32px)",
    },
    weight: {
      base: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      base: "20px",
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.6",
    },
  },
  space: {
    1: "1px",
    2: "2px",
    3: "4px",
    4: "6px",
    5: "8px",
    6: "12px",
    7: "14px",
    8: "16px",
    9: "20px",
    10: "24px",
    11: "32px",
    12: "40px",
    13: "48px",
    14: "64px",
    15: "96px",
  },
  radius: {
    xs: "6px",
    sm: "8px",
    md: "10px",
    lg: "12px",
    xl: "16px",
    pill: "9999px",
  },
  shadow: {
    1: "0 0 0 1px #ebebeb",
    2: "0 0 0 1px rgba(0,0,0,0.08), 0 0 0 1px #fafafa",
    3: "0 0 0 2px #fff, 0 0 0 4px #0072f5",
    4: "0 0 0 1px #ebebeb, 0 1px 2px 0 rgba(0,0,0,0.05)",
    focus: "0 0 0 2px #0070f3",
  },
  motion: {
    duration: {
      instant: "100ms",
      fast: "150ms",
      normal: "1000ms",
    },
  },
  layout: {
    maxWidth: "1280px",
    contentWidth: "720px",
    sidebarWidth: "280px",
    inspectorWidth: "360px",
    navHeight: "64px",
  },
} as const;
