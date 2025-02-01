import type { SQL } from "drizzle-orm";

export type * from "drizzle-orm";

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}

export type Permission = "read" | "write" | "delete";
export type Entity =
  | "products"
  | "inventories"
  | "orders"
  | "customers"
  | "files"
  | "stores";
