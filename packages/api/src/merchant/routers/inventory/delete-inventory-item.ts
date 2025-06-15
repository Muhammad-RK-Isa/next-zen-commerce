import { and, eq } from "@nzc/db"
import { inventoryItems } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { genericOutputSchema } from "~/utils"

export const deleteInventoryItem = merchActiveStoreProcedure
  .route({
    method: "DELETE",
    path: "/inventory/{id}",
    tags: ["Inventory"],
    summary: "Delete inventory item",
  })
  .input(
    z.object({
      id: z.string({ required_error: "Inventory item id is required" }),
    })
  )
  .output(genericOutputSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input }) => {
    const storeId = context.session.activeStoreId
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId,
      requiredPermissions: [{ file: ["write"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You are not authorized to access this resource.",
      })
    }

    const [item] = await context.db
      .update(inventoryItems)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(inventoryItems.storeId, storeId),
          eq(inventoryItems.id, input.id)
        )
      )
      .returning({
        id: inventoryItems.id,
      })

    if (!item) {
      throw new ORPCError("NOT_FOUND", {
        message: "Inventory item not found",
      })
    }

    return {
      success: true,
      message: "Inventory item deleted successfully",
    }
  })
