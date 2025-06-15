import { members, stores } from "@nzc/db/schema"
import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const baseStoreSchema = createSelectSchema(stores)

export const baseMemberSchema = createSelectSchema(members)

export const storeCreateSchema = z.object({
  name: z
    .string({ required_error: "Store name is required" })
    .min(3, { message: "Store name must contain at least 3 characters." }),
})

export type StoreEntity = z.infer<typeof baseStoreSchema>
export type MemberEntity = z.infer<typeof baseMemberSchema>
export type StoreCreateSchemaType = z.infer<typeof storeCreateSchema>
