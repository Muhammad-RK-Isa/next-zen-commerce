import type { Config } from "drizzle-kit"

import path from "node:path"
import { env } from "./env"

export default {
  schema: path.join(__dirname, "./schema/index.ts"),
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  strict: true,
} satisfies Config
