import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"
import type { Cookie } from "oslo/cookie"
import { serializeCookie } from "oslo/cookie"

import { redisRepository } from "@nzc/redis"
import type { CompositeUser, UserSession } from "@nzc/validators/common"
import { env } from "../env"
import { generateSessionToken, parseCookieHeader } from "../utils"

class Auth {
  async createUserSession({
    user,
    ipAddress = null,
    userAgent = null,
    activeStoreId = null,
  }: {
    user: CompositeUser
    ipAddress?: string | null
    userAgent?: string | null
    activeStoreId?: string | null
  }) {
    const token = generateSessionToken()
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    const expiresAt = new Date(
      Date.now() + 60 * 60 * 24 * 7 * 1000
    ).toISOString()

    const session: UserSession = {
      id: sessionId,
      expiresAt,
      createdAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      userId: user.id,
      activeStoreId,
    }

    await redisRepository.createUserSession(session)

    const existingUser = await redisRepository.getUser(user.id)

    if (existingUser) {
      await redisRepository.updateUser(user.id, user)
    } else {
      await redisRepository.createUser(user)
    }

    return {
      id: token,
      user,
      expiresAt,
    }
  }

  async setActiveStore(token: string, storeId: string) {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    const validSession = await redisRepository.getUserSession(sessionId)

    if (!validSession) {
      throw new Error("Invalid session")
    }

    await redisRepository.updateUserSession(sessionId, {
      ...validSession,
      activeStoreId: storeId,
    })
  }

  generateSessionCookie(token: string, expires: Date): Cookie {
    const name = "session"
    const attributes: Cookie["attributes"] = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    }
    return {
      name,
      value: token,
      attributes,
      serialize: () => serializeCookie(name, token, attributes),
    }
  }

  generateBlankSessionCookie(): Cookie {
    const name = "session"
    const attributes: Cookie["attributes"] = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
    return {
      name,
      value: "",
      attributes,
      serialize: () => serializeCookie(name, "", attributes),
    }
  }

  readSessionCookie(cookieHeader: string): string | null {
    const cookies = parseCookieHeader(cookieHeader)
    return cookies.get("session") ?? null
  }

  async validateUserSession(token: string) {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    const validSession = await redisRepository.getUserSession(sessionId)

    if (!validSession) {
      return {
        session: null,
        user: null,
      }
    }

    const user = await redisRepository.getUser(validSession.userId)

    if (!user) {
      return {
        session: null,
        user: null,
      }
    }

    if (new Date() >= new Date(validSession.expiresAt)) {
      await redisRepository.deleteUserSession(sessionId)
      return {
        session: null,
        user: null,
      }
    }

    return {
      session: {
        ...validSession,
        id: token,
      },
      user,
    }
  }

  async invalidateSession(token: string) {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    await redisRepository.deleteUserSession(sessionId)
  }
}

export const auth = new Auth()
