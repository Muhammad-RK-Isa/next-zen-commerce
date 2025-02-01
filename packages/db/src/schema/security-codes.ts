import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { generateExpiryDate } from "../utils";

export const securityCodes = pgTable(
  "security_codes",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => generateExpiryDate(5, "m")),
  },
  (t) => [
    index("identifier_idx").on(t.identifier),
    index("code_idx").on(t.code),
    primaryKey({
      columns: [t.identifier, t.code],
    }),
  ],
);
