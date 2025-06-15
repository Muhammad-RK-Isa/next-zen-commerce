import { discord } from "@nzc/auth/oauth"
import { generateCodeVerifier, generateState } from "arctic"
import { serializeCookie } from "oslo/cookie"
import type { Cookie } from "oslo/cookie"
import { z } from "zod"
import { env } from "~/env"
import { merchPubProcedure } from "~/merchant/orpc"

export const signInWithDiscord = merchPubProcedure
  .route({
    method: "POST",
    path: "/auth/signin/discord",
    tags: ["Auth"],
    summary: "Sign-in with Discord",
  })
  .input(
    z.object({
      redirectUrl: z.string().url(),
    })
  )
  .output(
    z.object({
      authorizationUrl: z.string().url(),
    })
  )
  .handler(async ({ context, input }) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    const combinedState = JSON.stringify({
      state,
      redirectUrl: input.redirectUrl,
    })
    const encodedCombinedState = Buffer.from(combinedState, "utf-8").toString(
      "base64"
    )

    const url = discord.createAuthorizationURL(
      encodedCombinedState,
      codeVerifier,
      ["identify", "email"]
    )

    const cookieAttributes: Cookie["attributes"] = {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    }

    const serializedStateCookie = serializeCookie(
      "discord_oauth_state",
      state,
      cookieAttributes
    )
    const serializedCodeVerifierCookie = serializeCookie(
      "discord_code_verifier",
      codeVerifier,
      cookieAttributes
    )

    context.res.headers.append("Set-Cookie", serializedStateCookie)
    context.res.headers.append("Set-Cookie", serializedCodeVerifierCookie)

    return { authorizationUrl: url.toString() }
  })
