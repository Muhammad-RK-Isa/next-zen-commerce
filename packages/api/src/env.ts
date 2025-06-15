import { env as authEnv } from "@nzc/auth/env"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  extends: [authEnv],
  server: {},
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_VALIDATION,
})
