import { auth } from "@nzc/auth/user"
import { and, eq, isNull } from "@nzc/db"
import { files, members, stores } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { genericOutputSchema } from "~/utils"

export const setActiveStore = merchAuthedProcedure
  .route({
    method: "POST",
    path: "/store/set-active",
    tags: ["Store", "Auth"],
    summary: "Set active store",
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    genericOutputSchema.extend({
      store: z.object({
        id: z.string(),
        name: z.string(),
        handle: z.string(),
        status: z.enum(["active", "inactive"]),
        role: z.enum(["owner", "member"]),
      }),
    })
  )
  .errors({
    NOT_FOUND: {},
    FORBIDDEN: {},
  })
  .handler(async ({ context, input }) => {
    const storeId = input.id

    const { isPermitted } = await validatePermission({
      userId: context.session.userId,
      storeId,
      requiredPermissions: [{ store: ["read"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have right permission to access this resource",
      })
    }

    const [store] = await context.db
      .select({
        id: stores.id,
        name: stores.name,
        handle: stores.handle,
        status: stores.status,
        role: members.role,
      })
      .from(stores)
      .innerJoin(
        members,
        and(eq(members.storeId, stores.id), eq(members.userId, context.user.id))
      )
      .leftJoin(files, eq(files.id, stores.fileId))
      .where(and(eq(stores.id, storeId), isNull(stores.deletedAt)))
      .limit(1)

    if (!store) {
      throw new ORPCError("NOT_FOUND", {
        message: "Store not found.",
      })
    }

    await auth.setActiveStore(context.session.id, input.id)

    return {
      success: true,
      message: `${store.name} is set as active`,
      store,
    }
  })
