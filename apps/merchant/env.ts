import { env as core } from '@nzc/next-config/env';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [core],
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  client: {},
  experimental__runtimeEnv: {},
});
