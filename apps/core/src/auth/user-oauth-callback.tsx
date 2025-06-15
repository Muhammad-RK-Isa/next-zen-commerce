import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { discord, github, google } from "@nzc/auth/oauth"
import { auth } from "@nzc/auth/user"
import { and, eq, isNull } from "@nzc/db"
import { db } from "@nzc/db/client"
import { members, stores, userAccounts, users } from "@nzc/db/schema"
import type { CompositeUser } from "@nzc/validators/common"
import { ObjectParser } from "@pilcrowjs/object-parser"
import { OAuth2RequestError, decodeIdToken } from "arctic"
import { Hono } from "hono"
import { getConnInfo } from "hono/bun"
import { getCookie, setCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import { RestartProcess } from "./restart-process"

export const userOauthCallbackRoutes = new Hono()
  .get("/google", async (c) => {
    const url = new URL(c.req.url)
    const code = url.searchParams.get("code")
    const encodedState = url.searchParams.get("state")
    const storedState = getCookie(c, "google_oauth_state")
    const codeVerifier = getCookie(c, "google_code_verifier")

    if (!code || !encodedState || !storedState || !codeVerifier) {
      return c.html(<RestartProcess />)
    }

    const decodedState = JSON.parse(
      Buffer.from(encodedState, "base64").toString("utf-8")
    ) as unknown as {
      state: string
      redirectUrl: string
    }

    const { state, redirectUrl } = decodedState

    if (state !== storedState) {
      return c.html(<RestartProcess redirectUrl={redirectUrl} />)
    }

    const [_, error] = await tryCatch(async () => {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier)

      const claims = decodeIdToken(tokens.idToken())
      const claimsParser = new ObjectParser(claims)

      const googleId = claimsParser.getString("sub")
      const name = claimsParser.getString("name")
      const avatar = claimsParser.getString("picture")
      const email = claimsParser.getString("email")

      let user: CompositeUser
      let activeStoreId: string | null = null

      const [existingUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          avatar: users.avatar,
          role: users.role,
          providerId: userAccounts.providerId,
          providerUserId: userAccounts.providerUserId,
        })
        .from(users)
        .leftJoin(
          userAccounts,
          and(
            eq(users.id, userAccounts.userId),
            eq(userAccounts.providerId, "google")
          )
        )
        .where(eq(users.email, email))

      if (existingUser) {
        const [firstStore] = await db
          .select({
            id: stores.id,
          })
          .from(stores)
          .innerJoin(members, eq(members.storeId, stores.id))
          .where(
            and(eq(members.userId, existingUser.id), isNull(stores.deletedAt))
          )
          .limit(1)

        activeStoreId = firstStore?.id ?? null

        if (existingUser.providerUserId) {
          user = existingUser as CompositeUser
        } else {
          const [acc] = await db
            .insert(userAccounts)
            .values({
              userId: existingUser.id,
              providerId: "google",
              providerUserId: googleId,
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          if (!existingUser.avatar) {
            await db
              .update(users)
              .set({ avatar })
              .where(eq(users.id, existingUser.id))
          }

          user = {
            ...existingUser,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        }
      } else {
        const newUser = await db.transaction(async (tx) => {
          const [u] = await tx
            .insert(users)
            .values({
              name,
              email,
              emailVerified: true,
              avatar,
            })
            .returning({
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              avatar: users.avatar,
              role: users.role,
            })

          if (!u) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          const [acc] = await tx
            .insert(userAccounts)
            .values({
              userId: u.id,
              providerId: "google",
              providerUserId: googleId,
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }
          return {
            ...u,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        })
        user = newUser
      }

      const ipAddress = getConnInfo(c).remote.address ?? null
      const userAgent = c.req.header("User-Agent") ?? null

      const session = await auth.createUserSession({
        user,
        ipAddress,
        userAgent,
        activeStoreId,
      })

      const sessionCookie = auth.generateSessionCookie(
        session.id,
        new Date(session.expiresAt)
      )
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )

      return c.redirect(redirectUrl, 302)
    })

    if (error) {
      if (error instanceof OAuth2RequestError) {
        return new Response(JSON.stringify({ message: "Invalid code" }), {
          status: 400,
        })
      }
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        {
          status: 500,
        }
      )
    }

    return c.redirect(redirectUrl, 302)
  })
  .get("/github", async (c) => {
    const url = new URL(c.req.url)
    const code = url.searchParams.get("code")
    const encodedState = url.searchParams.get("state")
    const storedState = getCookie(c, "github_oauth_state")

    if (!code || !encodedState || !storedState) {
      return c.html(<RestartProcess />)
    }

    const decodedState = JSON.parse(
      Buffer.from(encodedState, "base64").toString("utf-8")
    ) as unknown as {
      state: string
      redirectUrl: string
    }
    const { state, redirectUrl } = decodedState

    if (state !== storedState) {
      return c.html(<RestartProcess redirectUrl={redirectUrl} />)
    }

    const [_, error] = await tryCatch(async () => {
      const tokens = await github.validateAuthorizationCode(code)

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      const githubUserReponse: unknown = await githubUserResponse.json()
      const githubUserParser = new ObjectParser(githubUserReponse)

      const githubId = githubUserParser.getNumber("id")
      const name = githubUserParser.getString("login")
      const avatar = githubUserParser.getString("avatar_url")

      const githubAccessToken = tokens.accessToken()

      const emailListRequest = new Request("https://api.github.com/user/emails")
      emailListRequest.headers.set(
        "Authorization",
        `Bearer ${githubAccessToken}`
      )

      const emailListResponse = await fetch(emailListRequest)

      const emailListResult: unknown = await emailListResponse.json()
      if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
        return new Response("Please verify your account.", {
          status: 400,
        })
      }
      let email: string | null = null
      for (const emailRecord of emailListResult) {
        const emailParser = new ObjectParser(emailRecord)
        const primaryEmail = emailParser.getBoolean("primary")
        const verifiedEmail = emailParser.getBoolean("verified")
        if (primaryEmail && verifiedEmail) {
          email = emailParser.getString("email")
        }
      }
      if (email === null) {
        return new Response("Please verify your GitHub email address.", {
          status: 400,
        })
      }

      let user: CompositeUser
      let activeStoreId: string | null = null

      const [existingUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          avatar: users.avatar,
          role: users.role,
          providerId: userAccounts.providerId,
          providerUserId: userAccounts.providerUserId,
        })
        .from(users)
        .leftJoin(
          userAccounts,
          and(
            eq(users.id, userAccounts.userId),
            eq(userAccounts.providerId, "github")
          )
        )
        .where(eq(users.email, email))

      if (existingUser) {
        const [firstStore] = await db
          .select({
            id: stores.id,
          })
          .from(stores)
          .innerJoin(members, eq(members.storeId, stores.id))
          .where(
            and(eq(members.userId, existingUser.id), isNull(stores.deletedAt))
          )
          .limit(1)

        activeStoreId = firstStore?.id ?? null

        if (existingUser.providerUserId) {
          user = existingUser as CompositeUser
        } else {
          const [acc] = await db
            .insert(userAccounts)
            .values({
              userId: existingUser.id,
              providerId: "github",
              providerUserId: String(githubId),
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          if (!existingUser.avatar) {
            await db
              .update(users)
              .set({ avatar })
              .where(eq(users.id, existingUser.id))
          }

          user = {
            ...existingUser,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        }
      } else {
        const newUser = await db.transaction(async (tx) => {
          const [u] = await tx
            .insert(users)
            .values({
              name,
              email,
              emailVerified: true,
              avatar,
            })
            .returning({
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              avatar: users.avatar,
              role: users.role,
            })

          if (!u) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          const [acc] = await tx
            .insert(userAccounts)
            .values({
              userId: u.id,
              providerId: "github",
              providerUserId: String(githubId),
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }
          return {
            ...u,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        })

        user = newUser
      }

      const ipAddress = getConnInfo(c).remote.address ?? null
      const userAgent = c.req.header("User-Agent") ?? null

      const session = await auth.createUserSession({
        user,
        ipAddress,
        userAgent,
        activeStoreId,
      })

      const sessionCookie = auth.generateSessionCookie(
        session.id,
        new Date(session.expiresAt)
      )
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )

      return c.redirect(redirectUrl, 302)
    })

    if (error) {
      if (error instanceof OAuth2RequestError) {
        return new Response(JSON.stringify({ message: "Invalid code" }), {
          status: 400,
        })
      }
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        {
          status: 500,
        }
      )
    }

    return c.redirect(redirectUrl, 302)
  })
  .get("/discord", async (c) => {
    const url = new URL(c.req.url)
    const code = url.searchParams.get("code")
    const encodedState = url.searchParams.get("state")
    const storedState = getCookie(c, "discord_oauth_state")
    const codeVerifier = getCookie(c, "discord_code_verifier")

    if (!code || !encodedState || !storedState || !codeVerifier) {
      return c.html(<RestartProcess />)
    }

    const decodedState = JSON.parse(
      Buffer.from(encodedState, "base64").toString("utf-8")
    ) as unknown as {
      state: string
      redirectUrl: string
    }
    const { state, redirectUrl } = decodedState

    if (state !== storedState) {
      return c.html(<RestartProcess redirectUrl={redirectUrl} />)
    }

    const [_, error] = await tryCatch(async () => {
      const tokens = await discord.validateAuthorizationCode(code, codeVerifier)

      const discordUserResponse = await fetch(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        }
      )
      const discordUserJson: unknown = await discordUserResponse.json()
      const discordUserParser = new ObjectParser(discordUserJson)

      const discordId = discordUserParser.getString("id")
      const name = discordUserParser.getString("username")
      const email = discordUserParser.getString("email")
      const verified = discordUserParser.getBoolean("verified")
      const avatarHash = discordUserParser.getString("avatar")

      if (!email || !verified) {
        return new Response("Please verify your Discord email address.", {
          status: 400,
        })
      }

      const avatar = avatarHash
        ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.webp`
        : null

      let user: CompositeUser
      let activeStoreId: string | null = null

      const [existingUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          avatar: users.avatar,
          role: users.role,
          providerId: userAccounts.providerId,
          providerUserId: userAccounts.providerUserId,
        })
        .from(users)
        .leftJoin(
          userAccounts,
          and(
            eq(users.id, userAccounts.userId),
            eq(userAccounts.providerId, "discord")
          )
        )
        .where(eq(users.email, email))

      if (existingUser) {
        const [firstStore] = await db
          .select({
            id: stores.id,
          })
          .from(stores)
          .innerJoin(members, eq(members.storeId, stores.id))
          .where(
            and(eq(members.userId, existingUser.id), isNull(stores.deletedAt))
          )
          .limit(1)

        activeStoreId = firstStore?.id ?? null

        if (existingUser.providerUserId) {
          user = existingUser as CompositeUser
        } else {
          const [acc] = await db
            .insert(userAccounts)
            .values({
              userId: existingUser.id,
              providerId: "discord",
              providerUserId: String(discordId),
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          if (!existingUser.avatar && avatar) {
            await db
              .update(users)
              .set({ avatar })
              .where(eq(users.id, existingUser.id))
          }

          user = {
            ...existingUser,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        }
      } else {
        const newUser = await db.transaction(async (tx) => {
          const [u] = await tx
            .insert(users)
            .values({
              name,
              email,
              emailVerified: true,
              avatar,
            })
            .returning({
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              avatar: users.avatar,
              role: users.role,
            })

          if (!u) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }

          const [acc] = await tx
            .insert(userAccounts)
            .values({
              userId: u.id,
              providerId: "discord",
              providerUserId: String(discordId),
            })
            .returning()

          if (!acc) {
            throw new HTTPException(500, {
              message: "Something went wrong.",
            })
          }
          return {
            ...u,
            providerId: acc?.providerId,
            providerUserId: acc?.providerUserId,
          }
        })

        user = newUser
      }

      const ipAddress = getConnInfo(c).remote.address ?? null
      const userAgent = c.req.header("User-Agent") ?? null

      const session = await auth.createUserSession({
        user,
        ipAddress,
        userAgent,
        activeStoreId,
      })

      const sessionCookie = auth.generateSessionCookie(
        session.id,
        new Date(session.expiresAt)
      )
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )

      return c.redirect(redirectUrl, 302)
    })

    if (error) {
      if (error instanceof OAuth2RequestError) {
        return new Response(JSON.stringify({ message: "Invalid code" }), {
          status: 400,
        })
      }
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        {
          status: 500,
        }
      )
    }

    return c.redirect(redirectUrl, 302)
  })
