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

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: "u" })),
    name: text("name"),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 24 }).unique(),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    emailVerified: boolean("email_verified").notNull().default(false),
    avatar: text("avatar"),
    password: varchar("password", { length: 255 }),
    role: varchar("role", {
      length: 30,
      enum: ["admin", "super_admin", "user"],
    })
      .notNull()
      .default("user"),
    ...lifecycleDates,
  },
  (t) => [
    index("user_name_idx").on(t.name),
    uniqueIndex("email_idx").on(lower(t.email)),
    uniqueIndex("phone_idx").on(t.phone),
    check(
      "user_email_or_phone_check",
      sql`(email IS NOT NULL OR phone IS NOT NULL)`,
    ),
  ],
);
