import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core"

import { generateId, lifecycleDates, lower } from "../utils"

export const users = pgTable(
  "users",
  (t) => ({
    id: t
      .text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: "user" })),
    name: t.text("name").notNull(),
    email: t.text("email").notNull(),
    emailVerified: t.boolean("email_verified").notNull().default(false),
    avatar: t.text("avatar"),
    role: t
      .varchar("role", {
        length: 16,
        enum: ["admin", "user"],
      })
      .notNull()
      .default("user"),
    ...lifecycleDates,
  }),
  (t) => [
    index("user_name_idx").on(t.name),
    uniqueIndex("user_email_idx").on(lower(t.email)),
  ]
)
