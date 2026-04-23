/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1B2330",
          700: "#2F3848",
          500: "#5C6475",
          300: "#A6ADBD",
        },
        cream: {
          50: "#FAF8F4",
          100: "#F4F0E8",
          200: "#E8E2D4",
        },
        accent: {
          DEFAULT: "#2E5FCB",
          soft: "#E8EFFC",
          dark: "#244FA8",
        },
        good: "#2E7D5B",
        warn: "#C77A1F",
        bad: "#B0463E",
      },
      borderRadius: {
        soft: "14px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 28px rgba(27, 35, 48, 0.08)",
        lift: "0 14px 42px rgba(27, 35, 48, 0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "PT Sans",
          "Roboto",
          "Noto Sans",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
