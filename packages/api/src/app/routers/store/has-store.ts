import { and, count, eq, isNull } from "@nzc/db";
import { stores, usersStores } from "@nzc/db/schema";

import type { ProtectedAppContext } from "../../trpc";

export async function hasStore(ctx: ProtectedAppContext) {
  const total = await ctx.db
    .select({
      count: count(),
    })
    .from(stores)
    .innerJoin(usersStores, eq(usersStores.storeId, stores.id))
    .where(and(eq(usersStores.userId, ctx.user.id), isNull(stores.deletedAt)))
    .execute()
    .then((res) => res[0]?.count ?? 0);

  return !!total;
}
