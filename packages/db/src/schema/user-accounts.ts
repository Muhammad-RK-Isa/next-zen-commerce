import { pgTable } from "drizzle-orm/pg-core"

import { users } from "../schema"
import { generateId, lifecycleDates } from "../utils"

export const userAccounts = pgTable("user_accounts", (t) => ({
  id: t
    .text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId({ prefix: "u_acc" })),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  providerId: t
    .text("provider_id", {
      enum: ["discord", "github", "google"],
    })
    .notNull(),
  providerUserId: t.text("provider_user_id"),
  ...lifecycleDates,
}))
