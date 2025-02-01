import { pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { generateId, lifecycleDates } from "../utils";

export const stores = pgTable(
  "stores",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: "store" })),
    name: text("name").notNull(),
    handle: text("handle").notNull().unique(),
    status: varchar("status", {
      length: 255,
      enum: ["active", "inactive"],
    })
      .notNull()
      .default("active"),
    ...lifecycleDates,
  },
  (t) => [uniqueIndex("store_handle_idx").on(t.handle)],
);
