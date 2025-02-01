import { TRPCError } from "@trpc/server";

import type { StoreCreateSchemaType } from "@nzc/validators/app";
import { stores, usersStores } from "@nzc/db/schema";
import { isPostgresError } from "@nzc/db/utils";
import { redis } from "@nzc/redis";

import type { ProtectedAppContext } from "../../trpc";

export async function createStore(
  ctx: ProtectedAppContext,
  input: StoreCreateSchemaType,
) {
  try {
    await ctx.db.transaction(async (tx) => {
      const [storeRow] = await tx
        .insert(stores)
        .values({
          name: input.name,
          handle: input.handle,
        })
        .returning({
          id: stores.id,
        });

      if (!storeRow)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store",
        });

      const [usersStoresRow] = await tx
        .insert(usersStores)
        .values({
          storeId: storeRow.id,
          userId: ctx.user.id,
          role: "owner",
        })
        .returning();

      if (!usersStoresRow)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store",
        });

      const result = await redis.set(
        `users_stores:${usersStoresRow.id}`,
        JSON.stringify(usersStoresRow),
      );

      if (!result)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store",
        });
    });
    return { success: true };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23505") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Handle is unavailable",
      });
    }
  }
}
