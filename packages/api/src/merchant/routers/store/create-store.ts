import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { auth } from "@nzc/auth/user"
import { members, stores } from "@nzc/db/schema"
import { storeCreateSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { genericOutputSchema } from "~/utils"

export const createStore = merchAuthedProcedure
  .route({
    method: "POST",
    path: "/store/create",
    tags: ["Store"],
    summary: "Create a store",
  })
  .input(storeCreateSchema)
  .output(genericOutputSchema)
  .handler(
    async ({ context, input }) =>
      await context.db.transaction(async (tx) => {
        const [storeRow] = await tx
          .insert(stores)
          .values({
            name: input.name,
          })
          .returning()

        if (!storeRow) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create store.",
          })
        }

        const [membersRow] = await tx
          .insert(members)
          .values({
            storeId: storeRow.id,
            userId: context.user.id,
            role: "owner",
          })
          .returning()

        if (!membersRow) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create store.",
          })
        }

        const [_, redisError] = await tryCatch(async () => {
          await context.redis.createStoreMember(storeRow, membersRow)
        })

        if (redisError) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create store.",
            data: redisError,
          })
        }

        await auth.setActiveStore(context.session.id, storeRow.id)

        return {
          success: true,
          message: "Store created successfully.",
        }
      })
  )
