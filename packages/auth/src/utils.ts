export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    timeCost: 2,
    memoryCost: 19456,
  });
}

export async function verifyPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

export function generateRandomOTP(): string {
  const max = 999999;
  const min = 100000;
  const randomInt =
    Math.floor(
      // @typescript-eslint/no-non-null-assertion
      (crypto.getRandomValues(new Uint32Array(1))[0]! / (0xffffffff + 1)) *
        (max - min + 1),
    ) + min;
  return String(randomInt);
}

export function parseCookieHeader(cookieHeader: string) {
  // Handle empty cookie header
  if (!cookieHeader) {
    return createCookieAPI({});
  }

  // Parse the cookie string into an object
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [keyPart, ...valueParts] = cookie.split("=");
      const key = keyPart?.trim();

      // Skip empty keys
      if (!key) {
        return acc;
      }

      // Join value parts back together in case the value contained '=' characters
      const value = valueParts.join("=").trim();

      // Only set if we have both key and value
      if (value) {
        try {
          acc[key] = decodeURIComponent(value);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // If decoding fails, use the raw value
          acc[key] = value;
        }
      }

      return acc;
    },
    {} as Record<string, string>,
  );

  return createCookieAPI(cookies);
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
      return cookies[name];
    },

    /**
     * Sets a cookie.
     *
     * @param name - The name of the cookie.
     * @param value - The value of the cookie.
     */
    set(name: string, value: string): void {
      cookies[name] = value;
    },

    /**
     * Deletes a cookie by its name.
     *
     * @param name - The name of the cookie.
     */
    delete(name: string): void {
      delete cookies[name];
    },

    /**
     * Serializes the cookies back into a "Cookie" header format.
     *
     * @returns A string representing the serialized cookies.
     */
    serialize(): string {
      return Object.entries(cookies)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("; ");
    },
  };
}
