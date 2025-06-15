import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { eq } from "@nzc/db"
import { stores } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { genericOutputSchema, isPostgresError, pickNonNullish } from "~/utils"

export const updateStore = merchAuthedProcedure
  .route({
    method: "PATCH",
    path: "/store/{id}",
    tags: ["Store"],
    summary: "Update store",
  })
  .input(
    z.object({
      id: z.string(),
      handle: z.string().nullish(),
      name: z.string().nullish(),
    })
  )
  .output(genericOutputSchema)
  .errors({
    FORBIDDEN: {},
    CONFLICT: {},
  })
  .handler(async ({ context, input }) => {
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId: input.id,
      requiredPermissions: [{ store: ["write"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not permitted to perform this action.",
      })
    }

    const nonEmptyValues = pickNonNullish(input)

    const [_, error] = await tryCatch(async () => {
      await context.db
        .update(stores)
        .set(nonEmptyValues)
        .where(eq(stores.id, input.id))
    })

    if (isPostgresError(error) && error.errno === "23505") {
      throw new ORPCError("CONFLICT", {
        message: "This handle is unavailable.",
      })
    }

    return {
      success: true,
      message: "Store updated successfully.",
    }
  })
