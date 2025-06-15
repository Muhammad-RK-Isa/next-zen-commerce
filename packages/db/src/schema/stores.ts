import { pgTable } from "drizzle-orm/pg-core"

import { generateId, generateUniqueSlug, lifecycleDates } from "../utils"

export const stores = pgTable("stores", (t) => ({
  id: t
    .text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId({ prefix: "store" })),
  name: t.text("name").notNull(),
  handle: t
    .text("handle")
    .notNull()
    .unique()
    .$defaultFn(() => generateUniqueSlug()),
  fileId: t.text("file_id"),
  status: t
    .varchar("status", {
      length: 24,
      enum: ["active", "inactive"],
    })
    .notNull()
    .default("active"),
  ...lifecycleDates,
}))
