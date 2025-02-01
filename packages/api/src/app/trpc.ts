import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";

import { validateUserRequest } from "@nzc/auth/validate-user-request";
import { db } from "@nzc/db/client";
import { redis } from "@nzc/redis";

export const createAppContext = async (opts: FetchCreateContextFnOptions) => {
  const { user, session } = await validateUserRequest({
    req: opts.req,
    resHeaders: opts.resHeaders,
  });
  return {
    db,
    redis,
    user,
    session,
    ...opts,
  };
};

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Awaited<ReturnType<typeof createAppContext>>>()
  .create({
    transformer: SuperJSON,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createAppRouter = t.router;

export const publicAppProcedure = t.procedure;

export const protectedAppProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
    },
  });
});

export type AppContext = Awaited<ReturnType<typeof createAppContext>>;
export type ProtectedAppContext = AppContext & {
  user: NonNullable<AppContext["user"]>;
  session: NonNullable<AppContext["session"]>;
};
