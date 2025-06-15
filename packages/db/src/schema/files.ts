import * as t from "drizzle-orm/pg-core"

import { lifecycleDates } from "../utils"
import { stores } from "./stores"

export const files = t.pgTable("files", {
  id: t.text("id").primaryKey().notNull(),
  type: t
    .varchar("type", {
      length: 30,
      enum: ["image", "video", "audio", "document"],
    })
    .notNull(),
  mimeType: t.text().notNull(),
  name: t.text("name").notNull(),
  url: t.text("url").notNull(),
  size: t.integer("size").notNull(),
  description: t.text("description"),
  alt: t.text("alt"),
  caption: t.text("caption"),
  storeId: t
    .text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  createdAt: lifecycleDates.createdAt,
  updatedAt: lifecycleDates.updatedAt,
})
