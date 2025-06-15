import { and, eq, isNull, sql } from "@nzc/db"
import { files, members, stores } from "@nzc/db/schema"
import { ORPCError } from "@orpc/server"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"

export const getActiveStore = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/store/active",
    summary: "Get active store",
    tags: ["Store"],
  })
  .handler(async ({ context }) => {
    const storeId = context.session.activeStoreId

    if (!storeId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Current session does not have an active store id provided",
      })
    }

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

    const [r] = await context.db
      .select({
        id: stores.id,
        name: stores.name,
        handle: stores.handle,
        logo: files,
        status: stores.status,
        role: members.role,
        customTag: sql<string>`COALESCE(${members.customTag}, '')`,
        permissions: members.permissions,
        createdAt: stores.createdAt,
        updatedAt: stores.updatedAt,
      })
      .from(stores)
      .innerJoin(
        members,
        and(eq(members.storeId, stores.id), eq(members.userId, context.user.id))
      )
      .leftJoin(files, eq(files.id, stores.fileId))
      .where(and(eq(stores.id, storeId), isNull(stores.deletedAt)))
      .limit(1)

    return r
  })
