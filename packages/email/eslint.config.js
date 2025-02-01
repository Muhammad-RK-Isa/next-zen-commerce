import baseConfig from "@nzc/eslint-config/base";
import reactConfig from "@nzc/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [{ ignores: ["dist"] }, ...baseConfig, ...reactConfig];
