import { pgTable } from "drizzle-orm/pg-core"
import { generateId, lifecycleDates } from "../utils"
import { files } from "./files"
import { inventoryItems } from "./inventory-items"
import { products } from "./products"

export const productVariants = pgTable("product_variants", (t) => ({
  id: t
    .text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId({ prefix: "prod_var" })),
  mrp: t.real("mrp").notNull(),
  price: t.real("price").notNull(),
  currencyCode: t.text("currency_code").notNull(),
  productId: t
    .text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  inventoryItemId: t
    .text("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "set null" }),
  imageId: t.text("image_id").references(() => files.id, {
    onDelete: "set null",
  }),
  ...lifecycleDates,
}))
