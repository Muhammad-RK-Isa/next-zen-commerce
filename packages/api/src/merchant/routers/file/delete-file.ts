import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { and, eq } from "@nzc/db"
import { files } from "@nzc/db/schema"
import { utapi } from "@nzc/storage/server"
import { baseFileSchema } from "@nzc/validators/common"
import { ORPCError } from "@orpc/server"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { genericOutputSchema } from "~/utils"

const inputSchema = baseFileSchema.pick({ id: true })

export const deleteFile = merchActiveStoreProcedure
  .route({
    method: "DELETE",
    path: "/file/{id}",
    tags: ["File"],
    summary: "Delete a file",
  })
  .input(inputSchema)
  .output(genericOutputSchema)
  .errors({
    FORBIDDEN: {},
    BAD_REQUEST: {},
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

    await context.db.transaction(async (tx) => {
      const file = await tx.query.files.findFirst({
        where: (t, { eq }) => eq(t.id, input.id),
      })

      if (!file) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Invalid file id",
        })
      }

      if (file.storeId !== storeId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not authorized to access this resource.",
        })
      }

      const [data, storageError] = await tryCatch(async () => {
        return await utapi.deleteFiles(input.id)
      })

      if (storageError) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete file from storage",
          cause: storageError.cause,
        })
      }

      if (data.deletedCount === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Invalid file id",
        })
      }

      await tx
        .delete(files)
        .where(and(eq(files.storeId, storeId), eq(files.id, input.id)))
    })

    return {
      success: true,
      message: "File deleted successfully",
    }
  })
