import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { storeCreateSchema } from "@nzc/validators/app";

import { protectedAppProcedure } from "../../trpc";
import { createStore } from "./create-store";
import { getStoreByHandle } from "./get-store-by-handle";
import { getStoreById } from "./get-store-by-id";
import { hasStore } from "./has-store";
import { listStores } from "./list-stores";

export const storeRouter = {
  getById: protectedAppProcedure
    .input(z.string())
    .query(({ ctx, input }) => getStoreById(ctx, input)),
  getByHandle: protectedAppProcedure
    .input(z.string())
    .query(({ ctx, input }) => getStoreByHandle(ctx, input)),
  listStores: protectedAppProcedure.query(({ ctx }) => listStores(ctx)),
  hasStore: protectedAppProcedure.query(({ ctx }) => hasStore(ctx)),
  create: protectedAppProcedure
    .input(storeCreateSchema)
    .mutation(({ ctx, input }) => createStore(ctx, input)),
} satisfies TRPCRouterRecord;
