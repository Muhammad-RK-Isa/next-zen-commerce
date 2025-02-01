import type { Cookie } from "oslo/cookie";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { serializeCookie } from "oslo/cookie";

import type { customers, users } from "@nzc/db/schema";
import { env } from "@nzc/env";
import { redis } from "@nzc/redis";

import { parseCookieHeader } from "./utils";

const USER_KEY = "user";
const CUSTOMER_KEY = "customer";

export interface StoredUserSession {
  id: string;
  userId: string;
  expiresAt: number;
  isTwoFactorVerified: boolean;
}

export interface StoredCustomerSession {
  id: string;
  customerId: string;
  expiresAt: number;
  isTwoFactorVerified: boolean;
}

export type StoredUser = Pick<
  typeof users.$inferSelect,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "emailVerified"
  | "phoneVerified"
  | "avatar"
  | "role"
>;

export type StoredCustomer = Pick<
  typeof customers.$inferSelect,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "emailVerified"
  | "phoneVerified"
  | "storeId"
>;

export interface SessionFlags {
  isTwoFactorVerified: boolean;
}

function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

interface CreateUserSessionProps {
  user: StoredUser;
  flags: SessionFlags;
}

export async function createUserSession({
  user,
  flags,
}: CreateUserSessionProps) {
  const token = generateSessionToken();

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

  await redis.set(
    `session:${sessionId}`,
    JSON.stringify({
      id: sessionId,
      expiresAt,
      userId: user.id,
      isTwoFactorVerified: flags.isTwoFactorVerified,
    }),
    "EX",
    expiresAt,
  );

  await redis.hset(USER_KEY, user.id, JSON.stringify(user));

  await redis.sadd(`user_sessions:${user.id}`, sessionId);

  return {
    id: token,
    user,
    expiresAt,
    isTwoFactorVerified: flags.isTwoFactorVerified,
  };
}

interface CreateCustomerSessionProps {
  customer: StoredCustomer;
  flags: SessionFlags;
}

export async function createCustomerSession({
  customer,
  flags,
}: CreateCustomerSessionProps) {
  const token = generateSessionToken();

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

  await redis.set(
    `session:${sessionId}`,
    JSON.stringify({
      id: sessionId,
      expiresAt,
      userId: customer.id,
      isTwoFactorVerified: flags.isTwoFactorVerified,
    }),
    "EX",
    expiresAt,
  );

  await redis.hset(CUSTOMER_KEY, customer.id, JSON.stringify(customer));

  await redis.sadd(`customer_sessions:${customer.id}`, sessionId);

  return {
    id: token,
    customer,
    expiresAt,
    isTwoFactorVerified: flags.isTwoFactorVerified,
  };
}

function generateSessionCookie(token: string): Cookie {
  const name = "session";
  const attributes: Cookie["attributes"] = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
  return {
    name,
    value: token,
    attributes,
    serialize: () => serializeCookie(name, token, attributes),
  };
}

function generateBlankSessionCookie(): Cookie {
  const name = "session";
  const attributes: Cookie["attributes"] = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
  return {
    name,
    value: "",
    attributes,
    serialize: () => serializeCookie(name, "", attributes),
  };
}

function readSessionCookie(cookieHeader: string): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies.get("session") ?? null;
}

async function validateUserSession(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const validSession = await redis.get(`session:${sessionId}`);

  if (!validSession) {
    return {
      session: null,
      user: null,
    };
  }

  const validSessionData = JSON.parse(validSession) as StoredUserSession;

  const user = await redis.hget(USER_KEY, validSessionData.userId);

  if (!user) {
    return {
      session: null,
      user: null,
    };
  }

  const userData = JSON.parse(user) as StoredUser;

  if (Date.now() >= new Date(validSessionData.expiresAt * 1000).getTime()) {
    await redis.del(`session:${sessionId}`);
  }

  if (
    Date.now() >=
    new Date(validSessionData.expiresAt * 1000).getTime() -
      1000 * 60 * 60 * 24 * 15
  ) {
    console.log("RENEWING SESSION");
    const renewedExpiryDate = Math.floor(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime() / 1000,
    );
    await redis.set(
      `session:${validSessionData.id}`,
      JSON.stringify({
        id: validSessionData.id,
        userId: validSessionData.userId,
        expiresAt: renewedExpiryDate,
        isTwoFactorVerified: validSessionData.isTwoFactorVerified,
      }),
      "EX",
      renewedExpiryDate,
    );
  }

  return {
    session: {
      ...validSessionData,
      id: token,
    },
    user: userData,
  };
}

async function validateCustomerSession(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const validSession = await redis.get(`session:${sessionId}`);

  if (!validSession) {
    return {
      session: null,
      customer: null,
    };
  }

  const validSessionData = JSON.parse(validSession) as StoredCustomerSession;

  const customer = await redis.hget(CUSTOMER_KEY, validSessionData.customerId);

  if (!customer) {
    return {
      session: null,
      customer: null,
    };
  }

  const customerData = JSON.parse(customer) as StoredCustomer;

  if (Date.now() >= new Date(validSessionData.expiresAt * 1000).getTime()) {
    await redis.del(`session:${sessionId}`);
  }

  if (
    Date.now() >=
    new Date(validSessionData.expiresAt * 1000).getTime() -
      1000 * 60 * 60 * 24 * 15
  ) {
    console.log("RENEWING SESSION");
    const renewedExpiryDate = Math.floor(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime() / 1000,
    );
    await redis.set(
      `session:${validSessionData.id}`,
      JSON.stringify({
        id: validSessionData.id,
        customerId: validSessionData.customerId,
        expiresAt: renewedExpiryDate,
        isTwoFactorVerified: validSessionData.isTwoFactorVerified,
      }),
      "EX",
      renewedExpiryDate,
    );
  }

  return {
    session: {
      ...validSessionData,
      id: token,
    },
    customer: customerData,
  };
}

export async function invalidateSession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}

export const auth = {
  createUserSession,
  createCustomerSession,
  generateSessionCookie,
  generateBlankSessionCookie,
  readSessionCookie,
  validateUserSession,
  validateCustomerSession,
  invalidateSession,
};
