import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    ARCJET_KEY: z.string().startsWith("ajkey_"),
    DATABASE_URL: z.string().url(),
    EMAIL_FROM: z.string(),
    EMAIL_CONTACT: z.string().email(),
    EMAIL_SUPPORT: z.string().email(),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.number({ coerce: true }),
    EMAIL_USERNAME: z.string(),
    EMAIL_PASSWORD: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    REDIS_URL: z.string().url(),
    BACKEND_PORT: z.number({ coerce: true }).default(8000),
  },
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_APP_URL: z.string().url(),
    PUBLIC_STORE_URL: z.string().url(),
    PUBLIC_ADMIN_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
