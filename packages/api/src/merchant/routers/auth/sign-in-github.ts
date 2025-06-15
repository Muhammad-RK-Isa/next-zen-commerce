import { github } from "@nzc/auth/oauth"
import { generateState } from "arctic"
import { serializeCookie } from "oslo/cookie"
import type { Cookie } from "oslo/cookie"
import { z } from "zod"
import { env } from "~/env"
import { merchPubProcedure } from "~/merchant/orpc"

export const signInWithGithub = merchPubProcedure
  .route({
    method: "POST",
    path: "/auth/signin/github",
    tags: ["Auth"],
    summary: "Sign-in with Github",
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

    const combinedState = JSON.stringify({
      state,
      redirectUrl: input.redirectUrl,
    })
    const encodedCombinedState = Buffer.from(combinedState, "utf-8").toString(
      "base64"
    )

    const url = github.createAuthorizationURL(encodedCombinedState, [
      "user:email",
    ])

    const cookieAttributes: Cookie["attributes"] = {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    }

    const serializedStateCookie = serializeCookie(
      "github_oauth_state",
      state,
      cookieAttributes
    )

    context.res.headers.append("Set-Cookie", serializedStateCookie)

    return { authorizationUrl: url.toString() }
  })
