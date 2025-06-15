import { baseFileSchema } from "@nzc/validators/common"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

const outputSchema = baseFileSchema.omit({ storeId: true })

export const getFileById = merchActiveStoreProcedure
  .route({
    method: "GET",
    path: "/file/{id}",
    tags: ["File"],
    summary: "Get file by id",
  })
  .input(z.object({ id: z.string() }))
  .output(outputSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input }) => {
    const storeId = context.session.activeStoreId
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId,
      requiredPermissions: [{ file: ["read"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You are not authorized to access this resource.",
      })
    }

    const file = await context.db.query.files.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.id, input.id), eq(t.storeId, storeId)),
      columns: {
        storeId: false,
      },
    })

    if (!file) {
      throw new ORPCError("NOT_FOUND", {
        message: "File not found.",
      })
    }

    return file
  })
