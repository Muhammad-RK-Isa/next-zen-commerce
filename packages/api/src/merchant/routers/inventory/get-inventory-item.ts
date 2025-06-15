import { baseInventoryItemSchema } from "@nzc/validators/common"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

const outputSchema = baseInventoryItemSchema.omit({
  storeId: true,
  deletedAt: true,
})

export const getInventoryItem = merchActiveStoreProcedure
  .route({
    method: "GET",
    path: "/inventory/{id}",
    tags: ["Inventory"],
    summary: "Get inventory item by id",
  })
  .input(
    z.object({
      id: z.string({ required_error: "ID is required" }),
    })
  )
  .output(outputSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input }) => {
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

    const inventoryItem = await context.db.query.inventoryItems.findFirst({
      where: (t, { and, eq, isNull }) =>
        and(eq(t.id, input.id), eq(t.storeId, storeId), isNull(t.deletedAt)),
      columns: {
        storeId: false,
      },
    })

    if (!inventoryItem) {
      throw new ORPCError("NOT_FOUND", {
        message: "File not found.",
      })
    }

    return inventoryItem
  })
