import type { Config } from "tailwindcss";

import baseConfig from "@nzc/tailwind-config/web";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [...baseConfig.plugins],
} satisfies Config;
