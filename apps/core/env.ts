import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    CORE_PORT: z.number({ coerce: true }),
    CORE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
});
