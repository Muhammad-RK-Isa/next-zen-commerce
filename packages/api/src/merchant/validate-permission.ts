import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import type { members } from "@nzc/db/schema"
import type { Permission, Resource } from "@nzc/db/types"
import { redisRepository } from "@nzc/redis"
import { ORPCError } from "@orpc/server"

interface ValidatePermissionOptions {
  userId: string
  storeId: string
  requiredPermissions: Partial<Record<Resource, Permission[]>>[]
}

export async function validatePermission({
  userId,
  storeId,
  requiredPermissions,
}: ValidatePermissionOptions): Promise<{
  role: typeof members.$inferSelect.role | undefined
  isPermitted: boolean
}> {
  const [store, error] = await tryCatch(
    async () => await redisRepository.getStore(storeId)
  )

  if (error) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to fetch store",
      cause: error.cause,
    })
  }

  if (!store) {
    throw new ORPCError("NOT_FOUND", {
      message: "Store not found",
    })
  }

  const member = await redisRepository.getMember(userId)

  if (!member) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You are not authorized to access this store",
    })
  }

  const { role, permissions } = member

  if (role === "owner") {
    return { role, isPermitted: true }
  }

  const isPermitted = requiredPermissions.every((permissionSet) =>
    Object.entries(permissionSet).every(([entity, perms]) => {
      const entityPermissions = permissions[entity as Resource]
      if (!entityPermissions) {
        return false
      }

      return perms.every((perm) => entityPermissions.includes(perm))
    })
  )

  return { role, isPermitted }
}
