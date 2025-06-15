import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { auth } from "@nzc/auth/user"
import { eq } from "@nzc/db"
import { stores } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

export const deleteStore = merchAuthedProcedure
  .route({
    method: "DELETE",
    path: "/store/{id}",
    tags: ["Store"],
    summary: "Delete a store",
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const { role } = await validatePermission({
      userId: context.user.id,
      storeId: input.id,
      requiredPermissions: [{ store: ["write"] }],
    })

    if (role !== "owner") {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have permission to perform this action.",
      })
    }

    await context.db.transaction(async (tx) => {
      const members = await context.db.query.members.findMany({
        where: (t, { eq }) => eq(t.storeId, input.id),
        columns: {
          userId: true,
        },
      })

      const memberIds = members.map((member) => member.userId)

      const [_, error] = await tryCatch(async () => {
        await context.redis.deleteStoreMembers(input.id, memberIds)
      })

      if (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete store.",
          data: error,
        })
      }

      await tx
        .update(stores)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(stores.id, input.id))
    })

    const activeStoreId = context.session.activeStoreId

    if (activeStoreId === input.id) {
      await auth.setActiveStore(context.session.id, "")
    }

    return { id: input.id }
  })
