import { env } from '@nzc/db/env';
import * as schema from '@nzc/db/schema';
import { drizzle } from 'drizzle-orm/bun-sql';

export const db = drizzle({
  schema,
  connection: {
    url: env.DATABASE_URL,
  },
  casing: 'snake_case',
});
