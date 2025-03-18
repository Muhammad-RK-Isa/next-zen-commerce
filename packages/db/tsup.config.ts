import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "index.ts",
    "client.ts",
    "env.ts",
    "types.ts",
    "utils.ts",
    "schema/index.ts",
  ],
  format: ["esm"],
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: ["@nzc/tsconfig"],
})
