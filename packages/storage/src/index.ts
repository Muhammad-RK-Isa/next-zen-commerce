import { createRouteHandler } from "uploadthing/server"

import { uploadRouter } from "./core"
import { env } from "./env"

export const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
    isDev: env.NODE_ENV === "development",
    logLevel: "Error",
  },
})
