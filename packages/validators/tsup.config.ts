import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["common/index.ts", "merchant/index.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: ["@nzc/tsconfig"],
})
