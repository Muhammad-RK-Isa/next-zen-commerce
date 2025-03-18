import type { MetadataRoute } from "next"

import { env } from "~/env"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [""].map((route) => ({
    url: `${env.NEXT_PUBLIC_MERCHANT_URL}${route}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes]
}
