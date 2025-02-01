/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { NextConfig } from "next";

import "./src/env";

const config: NextConfig = {
  images: {
    minimumCacheTTL: 31536000,
  },
  rewrites: async () => [
    {
      source: "/api/app/:path*",
      destination: `${process.env.BACKEND_URL}/api/app/:path*`,
    },
  ],
  transpilePackages: ["@nzc/api", "@nzc/ui"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
