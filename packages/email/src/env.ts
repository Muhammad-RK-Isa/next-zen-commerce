import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    EMAIL_FROM: z.string(),
    EMAIL_CONTACT: z.string().email(),
    EMAIL_SUPPORT: z.string().email(),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.number({ coerce: true }),
    EMAIL_USERNAME: z.string(),
    EMAIL_PASSWORD: z.string(),
    MERCHANT_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_VALIDATION,
})
