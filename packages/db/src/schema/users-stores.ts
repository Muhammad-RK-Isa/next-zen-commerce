import { json, pgTable, varchar } from "drizzle-orm/pg-core";

import type { Entity, Permission } from "../types";
import { generateId, lifecycleDates } from "../utils";
import { stores } from "./stores";
import { users } from "./users";

const defaultPermissions: Record<Entity, Permission[]> = {
  products: ["read", "write"],
  inventories: ["read", "write"],
  orders: ["read", "write"],
  customers: ["read", "write"],
  files: ["read", "write", "delete"],
  stores: ["read"],
};

export const usersStores = pgTable("users_stores", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId({ prefix: "users_stores" })),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  storeId: varchar("store_id", { length: 255 })
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  role: varchar("role", {
    length: 30,
    enum: ["owner", "member"],
  })
    .notNull()
    .default("owner"),
  // ? Permissions are only necessary for the members of the store
  // ? and are not required as well as bypassed for the owner of the store
  permissions: json("permissions")
    .$type<Record<Entity, Permission[]>>()
    .notNull()
    .default(defaultPermissions),
  ...lifecycleDates,
});
