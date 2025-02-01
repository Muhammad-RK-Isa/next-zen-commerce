import baseConfig, { restrictEnvAccess } from "@nzc/eslint-config/base";

/** @type {import("typescript-eslint").Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...restrictEnvAccess,
];
