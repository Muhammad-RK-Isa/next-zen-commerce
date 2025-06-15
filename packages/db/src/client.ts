import { drizzle } from "drizzle-orm/bun-sql"
import { env } from "./env"
import * as schema from "./schema"

export const db = drizzle({
  schema,
  connection: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
})
