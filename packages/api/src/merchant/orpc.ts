import { os } from "@orpc/server"
import {
  activeStoreMiddleware,
  dbProviderMiddleware,
  optionalAuthMiddleware,
  redisProviderMiddleware,
  requiredAuthMiddleware,
} from "./middlewares"

export const merchPubProcedure = os
  .$context<{ req: Request; res: Response }>()
  .use(dbProviderMiddleware)
  .use(redisProviderMiddleware)
  .use(optionalAuthMiddleware)

export const merchAuthedProcedure = merchPubProcedure
  .use(requiredAuthMiddleware)
  .errors({
    UNAUTHORIZED: {},
  })

export const merchActiveStoreProcedure = merchAuthedProcedure.use(
  activeStoreMiddleware
)
