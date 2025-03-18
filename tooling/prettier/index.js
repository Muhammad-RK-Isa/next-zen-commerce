import { fileURLToPath } from "node:url"

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */

/** @type { PrettierConfig | TailwindConfig } */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: fileURLToPath(
    new URL("../ui/styles/globals.css", import.meta.url)
  ),
  tailwindFunctions: ["cn", "cva", "clsx", "tw"],
  importOrderTypeScriptVersion: "4.4.0",
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      options: {
        parser: "typescript",
      },
    },
  ],
}

export default config
