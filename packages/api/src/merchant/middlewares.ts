import { validateRequest } from "@nzc/auth/user/validate-request"
import { db as dbClient } from "@nzc/db/client"
import { redisRepository } from "@nzc/redis"
import type { UserSession } from "@nzc/validators/common"
import { os, ORPCError } from "@orpc/server"

export const dbProviderMiddleware = os
  .$context<{ db?: typeof dbClient }>()
  .middleware(async ({ context, next }) => {
    const db = context.db ?? dbClient
    return next({
      context: {
        db,
      },
    })
  })

export const redisProviderMiddleware = os
  .$context<{ redis?: typeof redisRepository }>()
  .middleware(async ({ context, next }) => {
    const redis = context.redis ?? redisRepository
    return next({
      context: {
        redis,
      },
    })
  })

export const optionalAuthMiddleware = os
  .$context<{ req: Request; res?: Response }>()
  .middleware(async ({ context, next }) => {
    const validSession = await validateRequest(context.req, context.res)
    return next({
      context: validSession,
    })
  })

export const requiredAuthMiddleware = os
  .$context<{ req: Request; res?: Response }>()
  .middleware(async ({ context, next }) => {
    const validSession = await validateRequest(context.req, context.res)
    if (!validSession.session || !validSession.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be authenticated to access this resource.",
      })
    }

    return next({
      context: {
        user: validSession.user,
        session: validSession.session,
      },
    })
  })

export const activeStoreMiddleware = os
  .$context<{ session: UserSession }>()
  .middleware(async ({ context, next }) => {
    const storeId = context.session?.activeStoreId

    if (!storeId) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "You must have an active store selected to access this resource.",
      })
    }

    return next({
      context: {
        session: {
          ...context.session,
          activeStoreId: storeId,
        },
      },
    })
  })

export function retry(options: { times: number }) {
  return os
    .$context<{ canRetry?: boolean }>()
    .middleware(({ context, next }) => {
      const canRetry = context.canRetry ?? true

      if (!canRetry) {
        return next()
      }

      let times = 0
      while (true) {
        try {
          return next({
            context: {
              canRetry: false,
            },
          })
        } catch (e) {
          if (times >= options.times) {
            throw e
          }

          times++
        }
      }
    })
}
