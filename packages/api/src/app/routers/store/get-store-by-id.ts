import { and, eq, isNull } from "@nzc/db";
import { stores, usersStores } from "@nzc/db/schema";

import type { ProtectedAppContext } from "../../trpc";

export async function getStoreById(ctx: ProtectedAppContext, id: string) {
  const [r] = await ctx.db
    .select({
      id: stores.id,
      name: stores.name,
      handle: stores.handle,
      status: stores.status,
      createdAt: stores.createdAt,
      updatedAt: stores.updatedAt,
    })
    .from(stores)
    .innerJoin(
      usersStores,
      and(
        eq(usersStores.storeId, stores.id),
        eq(usersStores.userId, ctx.user.id),
      ),
    )
    .where(and(eq(stores.id, id), isNull(stores.deletedAt)))
    .limit(1);

  return r;
}
