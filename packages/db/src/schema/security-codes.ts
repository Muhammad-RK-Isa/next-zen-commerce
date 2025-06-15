import { pgTable, primaryKey } from "drizzle-orm/pg-core"
import { generateExpiryDate, generateNumericCode } from "../utils"

export const securityCodes = pgTable(
  "security_codes",
  (t) => ({
    identifier: t.text().notNull(),
    code: t
      .text()
      .notNull()
      .$defaultFn(() => generateNumericCode(6)),
    createdAt: t.timestamp().notNull().defaultNow(),
    expiresAt: t
      .timestamp({
        mode: "date",
        withTimezone: true,
      })
      .notNull()
      .$defaultFn(() => generateExpiryDate(10, "m")),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.code] })]
)
