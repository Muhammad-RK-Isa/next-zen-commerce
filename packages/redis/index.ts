import type {} from "@nzc/validators/merchant"

import type { CompositeUser, UserSession } from "@nzc/validators/common"

import { redis } from "./client"
import { keys } from "./keys"

export const isEmpty = (obj: Record<string, unknown>): boolean =>
  Object.keys(obj).length === 0

class RedisRepository {
  async createUser(user: CompositeUser): Promise<void> {
    await redis.hset(keys.user(user.id), user)
  }

  async getUser(id: string): Promise<CompositeUser | null> {
    const user = await redis.hgetall(keys.user(id))
    return isEmpty(user) ? null : (user as unknown as CompositeUser)
  }

  async updateUser(id: string, updates: Partial<CompositeUser>): Promise<void> {
    await redis.hset(keys.user(id), updates)
  }

  async deleteUser(id: string): Promise<void> {
    await redis.del(keys.user(id))
  }

  async createUserSession(session: UserSession): Promise<void> {
    const sessionKey = keys.session(session.id)
    const userSessionsKey = keys.userSessions(session.userId)

    await redis
      .multi()
      .hset(sessionKey, session)
      .sadd(userSessionsKey, session.id)
      .exec()
  }

  async getUserSession(id: string): Promise<UserSession | null> {
    const session = await redis.hgetall(keys.session(id))
    return isEmpty(session) ? null : (session as unknown as UserSession)
  }

  async updateSession(
    id: string,
    updates: Partial<UserSession>
  ): Promise<void> {
    await redis.hset(keys.session(id), updates)
  }

  async deleteUserSession(id: string): Promise<void> {
    const session = await this.getUserSession(id)
    if (session) {
      await redis
        .multi()
        .del(keys.session(id))
        .srem(keys.userSessions(session.userId), id)
        .exec()
    }
  }
}

export const redisRepository = new RedisRepository()
