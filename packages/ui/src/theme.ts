export const theme = {
  color: {
    bg: "#FAF8F4",
    surface: "#FFFFFF",
    text: "#1B2330",
    textMuted: "#5C6475",
    accent: "#2E5FCB",
    accentSoft: "#E8EFFC",
    border: "#E6E3DC",
    success: "#2E7D5B",
    warning: "#C77A1F",
    danger: "#B0463E",
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
  },
  shadow: {
    soft: "0 8px 28px rgba(27, 35, 48, 0.08)",
    lift: "0 14px 42px rgba(27, 35, 48, 0.12)",
  },
  font: {
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PT Sans", Roboto, "Noto Sans", "Liberation Sans", Arial, sans-serif`,
  },
};

export type Theme = typeof theme;
