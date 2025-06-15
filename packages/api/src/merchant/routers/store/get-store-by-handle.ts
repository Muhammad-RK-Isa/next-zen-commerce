import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

export const getStoreByHandle = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/store/handle/{handle}",
    summary: "Get store by handle",
    tags: ["Store"],
  })
  .input(
    z.object({
      handle: z.string(),
    })
  )
  .handler(async ({ context, input }) => {
    const store = await context.db.query.stores.findFirst({
      where: (t, { eq }) => eq(t.handle, input.handle),
    })

    if (!store) {
      throw new ORPCError("NOT_FOUND", {
        message: "Store not found",
      })
    }

    const { isPermitted } = await validatePermission({
      userId: context.session.userId,
      storeId: store.id,
      requiredPermissions: [{ store: ["read"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have right permission to access this resource",
      })
    }

    return (
      (await context.db.query.stores.findFirst({
        where: (t, { eq }) => eq(t.handle, input.handle),
      })) ?? null
    )
  })
