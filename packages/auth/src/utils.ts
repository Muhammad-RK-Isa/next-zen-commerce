import crypto from "node:crypto"
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import Bun from "bun"
import { serializeCookie } from "oslo/cookie"

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20)
  crypto.getRandomValues(tokenBytes)
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase()
  return token
}

export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    timeCost: 2,
    memoryCost: 19456,
  })
}

export async function verifyPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await Bun.password.verify(password, hash)
}

export function generateRandomOTP(): string {
  const max = 999999
  const min = 100000
  const randomInt =
    Math.floor(
      // biome-ignore lint/style/noNonNullAssertion: The first element of the array is guaranteed to be non-null
      (crypto.getRandomValues(new Uint32Array(1))[0]! / (0xffffffff + 1)) *
        (max - min + 1)
    ) + min
  return String(randomInt)
}

export function parseCookieHeader(cookieHeader: string) {
  if (!cookieHeader) {
    return createCookieAPI({})
  }

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [keyPart, ...valueParts] = cookie.split("=")
      const key = keyPart?.trim()

      // Skip empty keys
      if (!key) {
        return acc
      }

      // Join value parts back together in case the value contained '=' characters
      const value = valueParts.join("=").trim()

      if (value) {
        try {
          acc[key] = decodeURIComponent(value)
        } catch {
          acc[key] = value
        }
      }

      return acc
    },
    {} as Record<string, string>
  )

  return createCookieAPI(cookies)
}

function createCookieAPI(cookies: Record<string, string>) {
  return {
    /**
     * Gets the value of a cookie by its name.
     *
     * @param name - The name of the cookie.
     * @returns The cookie value, or undefined if not found.
     */
    get(name: string): string | undefined {
      return cookies[name]
    },

    /**
     * Sets a cookie.
     *
     * @param name - The name of the cookie.
     * @param value - The value of the cookie.
     */
    set(name: string, value: string): void {
      cookies[name] = value
    },

    /**
     * Deletes a cookie by its name.
     *
     * @param name - The name of the cookie.
     */
    delete(name: string): void {
      delete cookies[name]
    },

    /**
     * Serializes the cookies back into a "Cookie" header format.
     *
     * @returns A string representing the serialized cookies.
     */
    serialize: serializeCookie,
  }
}

export const isEmpty = (obj: Record<string, unknown>): boolean =>
  Object.keys(obj).length === 0

export const processResults = <T>(
  results: [Error | null, Record<string, unknown>][] | null
): T[] =>
  (results ?? [])
    .filter(([err, item]) => !err && !isEmpty(item))
    .map(([_, item]) => item as T)
