import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@nzc/env";

import * as schema from "./schema";

const conn = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(conn, {
  schema,
  casing: "snake_case",
});
