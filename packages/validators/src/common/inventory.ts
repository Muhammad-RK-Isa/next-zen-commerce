import { inventoryItems } from "@nzc/db/schema"
import { createSelectSchema } from "drizzle-zod"

export const baseInventoryItemSchema = createSelectSchema(inventoryItems)

export type InventoryItemEntity = typeof inventoryItems.$inferSelect
