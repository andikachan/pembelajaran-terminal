import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090A",
        panel: {
          DEFAULT: "#101214",
          light: "#16191D",
          border: "#20252B",
          highlight: "#2B323B",
        },
        terminal: {
          DEFAULT: "#050606",
          header: "#0D0F11",
          border: "#1C2024",
        },
        retro: {
          green: "#7CFF6B",
          "green-dim": "#48B33A",
          amber: "#FFC857",
          "amber-dim": "#C49530",
          cyan: "#4EE2EC",
          red: "#FF5C5C",
          purple: "#B388FF",
          text: "#E6E6E6",
          muted: "#73777D",
          dim: "#3A3F45",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "glow-green": "0 0 15px -3px rgba(124, 255, 107, 0.25)",
        "glow-amber": "0 0 15px -3px rgba(255, 200, 87, 0.25)",
        "glow-cyan": "0 0 15px -3px rgba(78, 226, 236, 0.25)",
        "glow-red": "0 0 15px -3px rgba(255, 92, 92, 0.25)",
      },
      animation: {
        blink: "blink 1s step-start infinite",
        pulseFast: "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
