/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Config } from "tailwindcss";
import svgToDataUri from "mini-svg-data-uri";
import animate from "tailwindcss-animate";
// @ts-expect-error - This file doesn't have any type declarations
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        "dots-pattern": "radial-gradient(transparent 1px, #fafafa 1px)",
        "dots-pattern-dark": "radial-gradient(transparent 1px, #000 1px)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        "collapsible-down": {
          from: { height: "0", opacity: "0" },
          to: {
            height: "var(--radix-collapsible-content-height)",
          },
        },
        "collapsible-up": {
          from: {
            height: "var(--radix-collapsible-content-height)",
          },
          to: { height: "0", opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0", opacity: "0.5" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0", opacity: "0.5" },
        },
        "dialog-in": {
          from: { transform: "scale(0.95) translate(-50%, 0)", opacity: "0" },
          to: { transform: "scale(1) translate(-50%, 0)" },
        },
        "dialog-out": {
          from: { transform: "scale(1) translate(-50%, 0)" },
          to: { transform: "scale(0.95) translateY(-50%, 0)", opacity: "0" },
        },
        "popover-in": {
          from: { opacity: "0", transform: "scale(0.98) translateY(-4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "popover-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-4px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          to: { opacity: "0" },
        },
        blink: {
          "0%": {
            opacity: "0.2",
          },
          "20%": {
            opacity: "1",
          },
          "100% ": {
            opacity: "0.2",
          },
        },
        spinner: {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0.15",
          },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "fade-in": "fade-in 300ms ease",
        "fade-out": "fade-out 300ms ease",
        "dialog-in": "dialog-in 200ms cubic-bezier(0.32, 0.72, 0, 1)",
        "dialog-out": "dialog-out 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        "popover-in": "popover-in 150ms ease",
        "popover-out": "popover-out 150ms ease",
        "collapsible-down": "collapsible-down 150ms ease-out",
        "collapsible-up": "collapsible-up 150ms ease-out",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",

        blink: "blink 1.4s both infinite",
        spinner: "spinner 1.2s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      colors: {
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
    },
  },
  plugins: [animate, addDotBackgrounds, addVariablesForColors],
} satisfies Config;

function addDotBackgrounds({ matchUtilities, theme }: any) {
  matchUtilities(
    {
      "bg-grid": (value: any) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
        )}")`,
      }),
      "bg-grid-small": (value: any) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
        )}")`,
      }),
      "bg-dot": (value: any) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
        )}")`,
      }),
    },
    { values: flattenColorPalette(theme("backgroundColor")), type: "color" },
  );
}

function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
