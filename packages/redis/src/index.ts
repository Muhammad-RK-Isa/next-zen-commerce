import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { env } from "@nzc/env";

const globalForRedis = globalThis as unknown as {
  redisClient: RedisClientType | undefined;
};

const redisClient =
  globalForRedis.redisClient ??
  createClient({
    url: env.REDIS_URL,
  });

if (!globalForRedis.redisClient) {
  await redisClient
    .connect()
    .then(() => console.log("🍎 Redis client is connected! 🚀"));
  if (env.NODE_ENV !== "production") globalForRedis.redisClient = redisClient;
}

export const redis = redisClient;
