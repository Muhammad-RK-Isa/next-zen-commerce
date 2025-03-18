import withBundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

export const config: NextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "mfdexqv82f.ufs.sh",
      },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [48, 64, 96, 128, 256, 512, 1024],
  },
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${process.env.CORE_URL}/api/:path*`,
    },
  ],
  transpilePackages: ["@nzc/api", "@nzc/ui"],
}

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig)
