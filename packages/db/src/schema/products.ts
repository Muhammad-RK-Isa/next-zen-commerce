import { sql } from "drizzle-orm"
import { pgTable } from "drizzle-orm/pg-core"
import { generateId, lifecycleDates } from "../utils"
import { stores } from "./stores"

export const products = pgTable("products", (t) => ({
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => generateId({ prefix: "product" })),
  title: t.text("title").notNull(),
  handle: t.text("handle").notNull(),
  description: t.text("description"),
  metaDescription: t.text("meta_description"),
  metaTitle: t.text("meta_title"),
  status: t
    .varchar("status", {
      length: 24,
      enum: ["published", "draft", "archived"],
    })
    .notNull()
    .default("draft"),
  vendor: t.text("vendor"),
  tags: t.text("tags").array().notNull().default(sql`'{}'::text[]`),
  storeId: t
    .text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  ...lifecycleDates,
}))
