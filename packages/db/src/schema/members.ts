import { pgTable, primaryKey } from "drizzle-orm/pg-core"

import { stores } from "../schema"
import { users } from "../schema"
import type { Permission, Resource } from "../types"
import { lifecycleDates } from "../utils"

const defaultPermissions: Record<Resource, Permission[]> = {
  product: ["read", "write"],
  inventory: ["read", "write"],
  order: ["read", "write"],
  customer: ["read", "write"],
  file: ["read", "write"],
  store: ["read"],
}

export const members = pgTable(
  "members",
  (t) => ({
    userId: t
      .text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    storeId: t
      .text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    role: t
      .varchar("role", {
        length: 30,
        enum: ["owner", "member"],
      })
      .notNull()
      .default("owner"),
    customTag: t.text("custom_tag"),
    permissions: t
      .json("permissions")
      .$type<Record<Resource, Permission[]>>()
      .notNull()
      .default(defaultPermissions),
    ...lifecycleDates,
  }),
  (t) => [primaryKey({ columns: [t.userId, t.storeId] })]
)
