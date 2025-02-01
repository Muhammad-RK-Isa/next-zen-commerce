import { TRPCError } from "@trpc/server";

import type { Entity, Permission } from "@nzc/db/types";
import { and, eq } from "@nzc/db";
import { db } from "@nzc/db/client";
import { usersStores } from "@nzc/db/schema";
import { redis } from "@nzc/redis";

type UsersStoresEntity = typeof usersStores.$inferSelect;

export async function hasPermission(
  userId: string,
  storeId: string,
  entities: Entity | Entity[],
  requiredPermissions: Permission[],
): Promise<boolean> {
  let usersStoresRecord: UsersStoresEntity;

  const redisRow = JSON.parse(
    (await redis.get(`users_stores:${userId}`)) ?? "",
  ) as unknown as UsersStoresEntity | null;

  if (redisRow) {
    usersStoresRecord = redisRow;
  } else {
    const rows = await db
      .select()
      .from(usersStores)
      .where(
        and(eq(usersStores.userId, userId), eq(usersStores.storeId, storeId)),
      )
      .limit(1);

    if (!rows[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    usersStoresRecord = rows[0];
  }

  const { role, permissions } = usersStoresRecord;

  if (role === "owner") {
    return true;
  }

  // Normalize entities to an array
  const entityList = Array.isArray(entities) ? entities : [entities];

  // Check if the user has the required permissions for all specified entities
  return entityList.every((entity) =>
    requiredPermissions.every((perm) => permissions[entity].includes(perm)),
  );
}
