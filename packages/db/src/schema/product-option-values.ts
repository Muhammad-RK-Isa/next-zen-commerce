import { index, pgTable } from "drizzle-orm/pg-core"
import { generateId, lifecycleDates } from "../utils"
import { productOptions } from "./product-options"

export const productOptionValues = pgTable(
  "product_option_values",
  (t) => ({
    id: t
      .text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: "prod_opt_val" })),
    value: t.text("value").notNull(),
    optionId: t
      .text("option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  }),
  (t) => [index("product_option_value_idx").on(t.value)]
)
