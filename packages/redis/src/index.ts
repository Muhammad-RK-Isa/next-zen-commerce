import Redis from "ioredis";

import { env } from "@nzc/env";

const redisClient = new Redis(env.REDIS_URL);

export const redis = redisClient;
