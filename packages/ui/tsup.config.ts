import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "components/**/*.tsx",
    "lib/**/*.ts",
    "provider/**/*.tsx",
    "hooks/**/*.ts",
    "index.ts",
  ],
  format: ["esm"],
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "@nzc/tsconfig",
    "@radix-ui/*",
    "lucide-react",
    "tailwind-merge",
    "class-variance-authority",
  ],
  treeshake: true,
  splitting: true,
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
})
