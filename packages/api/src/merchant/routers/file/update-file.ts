import { and, eq } from "@nzc/db"
import { files } from "@nzc/db/schema"
import { updateFileSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { genericOutputSchema } from "~/utils"

export const updateFile = merchActiveStoreProcedure
  .route({
    method: "PATCH",
    path: "/file/{id}",
    tags: ["File"],
    summary: "Update file details",
  })
  .input(updateFileSchema)
  .output(genericOutputSchema)
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
        where: (t, { and, eq }) =>
          and(eq(t.storeId, storeId), eq(t.id, input.id)),
      })

      if (!file) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Invalid file id.",
        })
      }

      const fileExtension =
        file.name.substring(file.name.lastIndexOf(".")) || ""

      const updatedInput = {
        ...input,
        name: `${input.name}${fileExtension}`,
      }

      await tx
        .update(files)
        .set(updatedInput)
        .where(and(eq(files.id, input.id), eq(files.storeId, storeId)))
        .execute()
    })

    return {
      success: true,
      message: "File updated successfully",
    }
  })
