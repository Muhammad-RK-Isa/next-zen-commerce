import { sql } from "drizzle-orm"
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core"
import { generateId, lifecycleDates, lower } from "../utils"
import { files } from "./files"
import { stores } from "./stores"

export const inventoryItems = pgTable(
  "inventory_items",
  (t) => ({
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => generateId({ prefix: "inv_item" })),
    name: t.text("name").notNull(),
    description: t.text("description"),
    quantity: t.integer("quantity").notNull(),
    sku: t.text("sku"),
    fileId: t
      .text("file_id")
      .references(() => files.id, { onDelete: "set null" }),
    storeId: t
      .text()
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    material: t.text("material"),
    height: t.real("height"),
    width: t.real("width"),
    length: t.real("length"),
    weight: t.real("weight"),
    heightUnit: t
      .varchar("height_unit", {
        length: 8,
        enum: ["cm", "m", "ft", "in"],
      })
      .notNull()
      .default("cm"),
    widthUnit: t
      .varchar("width_unit", {
        length: 8,
        enum: ["cm", "m", "ft", "in"],
      })
      .notNull()
      .default("cm"),
    lengthUnit: t
      .varchar("length_unit", {
        length: 8,
        enum: ["cm", "m", "ft", "in"],
      })
      .notNull()
      .default("cm"),
    weightUnit: t
      .varchar("weight_unit", {
        length: 8,
        enum: ["g", "kg", "oz", "lb"],
      })
      .notNull()
      .default("g"),
    ...lifecycleDates,
  }),
  (t) => [
    index("inventory_item_name_idx").on(t.name),
    index("inventory_item_store_idx").on(t.storeId),
    uniqueIndex("unique_inventory_item_sku_idx")
      .on(lower(t.sku))
      .where(sql`sku IS NOT NULL`),
  ]
)
