import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { lifecycleDates } from "../utils";
import { stores } from "./stores";

export const files = pgTable("files", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  type: varchar("type", {
    length: 30,
    enum: ["image", "video", "audio", "document"],
  }).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  description: text("description"),
  alt: text("alt"),
  caption: text("caption"),
  storeId: varchar("store_id", { length: 255 })
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  createdAt: lifecycleDates.createdAt,
  updatedAt: lifecycleDates.updatedAt,
});
