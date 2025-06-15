import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import type { userAccounts } from "@nzc/db/schema"
import { users } from "@nzc/db/schema"

import type { PickExact } from "."

export const baseUserSchema = createSelectSchema(users)

export const userSession = z.object({
  id: z.string(),
  userId: z.string(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  expiresAt: z.string(),
  createdAt: z.string(),
  activeStoreId: z.string().nullish(),
})

export type UserEntity = z.infer<typeof baseUserSchema>
export type UserSession = z.infer<typeof userSession>

export type CompositeUser = PickExact<
  UserEntity,
  "id" | "name" | "email" | "emailVerified" | "avatar" | "role"
> &
  Partial<
    Pick<typeof userAccounts.$inferSelect, "providerId" | "providerUserId">
  >
