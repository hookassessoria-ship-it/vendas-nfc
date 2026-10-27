import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Tokens herdados do design system do RikuAI (rikuai-app/src/index.css).
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--foreground-muted))",
        subtle: "hsl(var(--foreground-subtle))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", dim: "hsl(var(--primary-dim))" },
        surface: { DEFAULT: "hsl(var(--surface))", raised: "hsl(var(--surface-raised))", overlay: "hsl(var(--surface-overlay))" },
        ok: "hsl(var(--success))",
        warn: "hsl(var(--warning))",
        bad: "hsl(var(--danger))",
        neutral: "hsl(var(--neutral))",
        demo: "hsl(var(--demo))",
      },
      fontFamily: { sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Inter", "system-ui", "sans-serif"] },
      borderRadius: { lg: "1rem", xl: "1.25rem", "2xl": "1.5rem" },
      keyframes: {
        "slide-up": { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "sheet-in": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: { "0%": { transform: "scale(.9)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "page-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "status-pop": { "0%": { transform: "scale(.88)" }, "60%": { transform: "scale(1.06)" }, "100%": { transform: "scale(1)" } },
        "celebrate-in": { "0%": { transform: "scale(.6)", opacity: "0" }, "55%": { transform: "scale(1.08)", opacity: "1" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "celebrate-out": { from: { opacity: "1" }, to: { opacity: "0", transform: "translateY(-8px)" } },
        "draw": { from: { strokeDashoffset: "48" }, to: { strokeDashoffset: "0" } },
        "ring": { "0%": { transform: "scale(.8)", opacity: ".7" }, "100%": { transform: "scale(1.9)", opacity: "0" } },
      },
      animation: {
        "slide-up": "slide-up .35s cubic-bezier(.16,.8,.24,1)",
        "sheet-in": "sheet-in .32s cubic-bezier(.16,.8,.24,1)",
        "fade-in": "fade-in .25s ease-out",
        pop: "pop .2s ease-out",
        "page-in": "page-in .22s cubic-bezier(.16,.8,.24,1)",
        "status-pop": "status-pop .35s cubic-bezier(.34,1.56,.64,1)",
        "celebrate-in": "celebrate-in .38s cubic-bezier(.34,1.56,.64,1) both",
        "celebrate-out": "celebrate-out .25s ease-in both",
        draw: "draw .42s .12s ease-out both",
        ring: "ring .7s ease-out both",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
