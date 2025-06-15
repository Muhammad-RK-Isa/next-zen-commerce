import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { and, eq, isNull, sql } from "@nzc/db"
import { inventoryItems } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

const outputSchema = z.object({
  min: z.number({ coerce: true }).default(0),
  max: z.number({ coerce: true }).default(0),
})

export const getInventoryItemQuantityRange = merchActiveStoreProcedure
  .route({
    method: "GET",
    path: "/inventory/quantity-range",
    tags: ["Inventory"],
    summary: "Get inventory item quantity range",
    description:
      "Get the maximum and the minimum quantity of an inventory item.",
  })
  .output(outputSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context }) => {
    const storeId = context.session.activeStoreId
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId,
      requiredPermissions: [{ inventory: ["read"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You are not authorized to access this resource.",
      })
    }
    const [range, error] = await tryCatch(async () => {
      return await context.db
        .select({
          min: sql<number>`min(${inventoryItems.quantity})`,
          max: sql<number>`max(${inventoryItems.quantity})`,
        })
        .from(inventoryItems)
        .where(
          and(
            isNull(inventoryItems.deletedAt),
            eq(inventoryItems.storeId, storeId)
          )
        )
        .then((res) => res[0] ?? { min: 0, max: 0 })
    })

    if (error) {
      return {
        min: 0,
        max: 0,
      }
    }
    return range
  })
