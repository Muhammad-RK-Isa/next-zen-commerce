import { and, eq, isNull } from "@nzc/db";
import { stores, usersStores } from "@nzc/db/schema";

import type { ProtectedAppContext } from "../../trpc";

export async function listStores(ctx: ProtectedAppContext) {
  const rows = await ctx.db
    .select({
      id: stores.id,
      name: stores.name,
      handle: stores.handle,
      status: stores.status,
      createdAt: stores.createdAt,
      updatedAt: stores.updatedAt,
      role: usersStores.role,
    })
    .from(stores)
    .innerJoin(usersStores, eq(usersStores.storeId, stores.id))
    .where(and(eq(usersStores.userId, ctx.user.id), isNull(stores.deletedAt)));

  return rows;
}
