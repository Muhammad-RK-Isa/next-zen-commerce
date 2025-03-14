import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const keys = () =>
  createEnv({
    server: {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      ANALYZE: z.boolean({ coerce: true }).optional(),
    },
    client: {
      NEXT_PUBLIC_MERCHANT_URL: z.string().min(1).url(),
      NEXT_PUBLIC_STORE_URL: z.string().min(1).url(),
      NEXT_PUBLIC_CORE_URL: z.string().min(1).url(),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_MERCHANT_URL: process.env.NEXT_PUBLIC_MERCHANT_URL,
      NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
      NEXT_PUBLIC_CORE_URL: process.env.NEXT_PUBLIC_CORE_URL,
    },
  });
