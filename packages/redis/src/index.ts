import type { CompositeUser, UserSession } from "@nzc/validators/common"
import type { MemberEntity, StoreEntity } from "@nzc/validators/merchant"

import { redis } from "./client"
import { keys } from "./keys"

export const isEmpty = (obj: Record<string, unknown>): boolean =>
  Object.keys(obj).length === 0

class RedisRepository {
  // <------------------User start------------------------->
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
  // <------------------User end------------------------->

  // <------------------User session start------------------------->
  async getUserSession(id: string): Promise<UserSession | null> {
    const session = await redis.hgetall(keys.userSession(id))
    return isEmpty(session) ? null : (session as unknown as UserSession)
  }

  async getAllUserSessions(userId: string): Promise<UserSession[]> {
    const sessionIds = await redis.smembers(keys.userSessionSet(userId))
    const sessions = await Promise.all(
      sessionIds.map(async (id) => await this.getUserSession(id))
    )
    return sessions.filter((session) => session !== null) as UserSession[]
  }

  async createUserSession(session: UserSession): Promise<void> {
    await redis
      .multi()
      .hset(keys.userSession(session.id), session)
      .sadd(keys.userSessionSet(session.userId), session.id)
      .exec()
  }

  async deleteUserSession(id: string): Promise<void> {
    const session = await this.getUserSession(id)

    if (!session) {
      return
    }

    await redis
      .multi()
      .del(keys.userSession(id))
      .srem(keys.userSessionSet(session.userId), id)
      .exec()
  }

  async updateUserSession(
    sessionId: string,
    values: Partial<UserSession>
  ): Promise<void> {
    await redis.hset(keys.userSession(sessionId), values)
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    const sessionIds = await redis.smembers(keys.userSessionSet(userId))
    await Promise.all(
      sessionIds.map((id) =>
        redis
          .multi()
          .del(keys.userSession(id))
          .del(keys.userSessionSet(userId))
          .exec()
      )
    )
  }
  // <------------------User session end------------------------->

  async createStoreMember(
    store: StoreEntity,
    member: MemberEntity
  ): Promise<void> {
    await redis
      .multi()
      .hset(keys.store(store.id), store)
      .hset(keys.member(member.userId), member)
      .exec()
  }

  async deleteStoreMembers(
    storeId: string,
    memberIds: string[]
  ): Promise<void> {
    const transaction = redis.multi().del(keys.store(storeId))

    memberIds.forEach((memberId) => {
      transaction.del(keys.member(memberId))
    })

    await transaction.exec()
  }

  async getStore(id: string): Promise<StoreEntity | null> {
    const store = await redis.hgetall(keys.store(id))
    return isEmpty(store) ? null : (store as unknown as StoreEntity)
  }

  async createMember(member: MemberEntity): Promise<void> {
    await redis.hset(keys.member(member.userId), member)
  }

  async deleteMember(id: string): Promise<void> {
    await redis.del(keys.member(id))
  }

  async getMember(userId: string): Promise<MemberEntity | null> {
    const member = await redis.hgetall(keys.member(userId))
    return isEmpty(member) ? null : (member as unknown as MemberEntity)
  }
}

export const redisRepository = new RedisRepository()
