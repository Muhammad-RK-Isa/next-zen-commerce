import Redis from "ioredis";

const redisClient = new Redis(
  "redis://default:oQpPmeFDN2kYBKlkLhqDWPoAy10gpHNL@redis-10055.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:10055",
);

export const redis = redisClient;
