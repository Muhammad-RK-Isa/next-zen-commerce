import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { generateId, lifecycleDates, lower } from "../utils";
import { stores } from "./stores";

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: "u" })),
    name: text("name"),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 24 }),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    emailVerified: boolean("email_verified").notNull().default(false),
    password: varchar("password", { length: 255 }),
    storeId: varchar("store_id")
      .references(() => stores.id)
      .notNull(),
    ...lifecycleDates,
  },
  (t) => [
    index("customer_name_idx").on(t.name),
    uniqueIndex("email_store_idx").on(lower(t.email), t.storeId),
    uniqueIndex("phone_store_idx").on(t.phone, t.storeId),
    check(
      "customer_email_or_phone_check",
      sql`(email IS NOT NULL OR phone IS NOT NULL)`,
    ),
  ],
);
