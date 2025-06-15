import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    ARCJET_KEY: z.string().startsWith("ajkey_"),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_VALIDATION,
})
