import type { SQL } from "drizzle-orm"

export type * from "drizzle-orm"

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

export type Permission = "read" | "write"
export type Resource =
  | "product"
  | "inventory"
  | "order"
  | "customer"
  | "file"
  | "store"

type NotificationProvider = "email" | "sms" | "push"

export interface StoreSettings {
  currency: string
  timezone: string
  notifications: Record<
    NotificationProvider,
    {
      promotions: boolean
      orders: boolean
      customers: boolean
    }
  >
}
