import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["index.ts", "env.ts", "oauth.ts", "utils.ts", "user/**/*.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: ["@nzc/tsconfig"],
})
