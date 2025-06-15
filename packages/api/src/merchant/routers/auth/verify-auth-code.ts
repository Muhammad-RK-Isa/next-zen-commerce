import { auth } from "@nzc/auth/user"
import { and, eq, isNull } from "@nzc/db"
import { members, securityCodes, stores, users } from "@nzc/db/schema"
import arcjet, { detectBot, tokenBucket } from "@nzc/security/bun"
import { verificationCodeSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchPubProcedure } from "~/merchant/orpc"
import { genericOutputSchema } from "~/utils"

export const verifyAuthCode = merchPubProcedure
  .route({
    method: "POST",
    path: "/auth/signin/verification",
    tags: ["Auth"],
    summary: "Verify authentication code",
    description: "Verify authentication code to sign-in using email",
  })
  .input(verificationCodeSchema)
  .output(genericOutputSchema)
  .errors({
    NOT_FOUND: {},
  })
  .handler(async ({ context, input }) => {
    const aj = arcjet
      .withRule(
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE"],
        })
      )
      .withRule(
        tokenBucket({
          mode: "LIVE",
          refillRate: 5,
          interval: 10,
          capacity: 10,
        })
      )

    const decision = await aj.protect(context.req, {
      requested: 5,
    })

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Bots are not allowed to perform this action",
        })
      }
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message:
          "Too many requests. You're temporarily blocked. Please try again after some time.",
      })
    }

    const validCode = await context.db.query.securityCodes.findFirst({
      where: (t, { and, eq, gt }) =>
        and(
          eq(t.identifier, input.identifier),
          eq(t.code, String(input.code)),
          gt(t.expiresAt, new Date())
        ),
    })

    if (!validCode) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Invalid verification code",
      })
    }

    await context.db
      .delete(securityCodes)
      .where(
        and(
          eq(securityCodes.code, validCode.code),
          eq(securityCodes.identifier, validCode.identifier)
        )
      )

    const user = await context.db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, input.identifier),
      columns: {
        createdAt: false,
        updatedAt: false,
        deletedAt: false,
      },
    })

    if (!user) {
      throw new ORPCError("NOT_FOUND", {
        message: "User not registered",
      })
    }

    if (!user.emailVerified) {
      await context.db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, user.id))
    }

    const [firstStore] = await context.db
      .select({
        id: stores.id,
      })
      .from(stores)
      .innerJoin(members, eq(members.storeId, stores.id))
      .where(and(eq(members.userId, user.id), isNull(stores.deletedAt)))
      .limit(1)

    const ipAddress =
      context.req.headers.get("x-forwarded-for")?.split(",")[0] ||
      context.req.headers.get("x-real-ip") ||
      context.req.headers.get("cf-connecting-ip") ||
      ""
    const userAgent = context.req.headers.get("User-Agent")

    const session = await auth.createUserSession({
      user: {
        ...user,
        emailVerified: true,
      },
      ipAddress,
      userAgent,
      activeStoreId: firstStore?.id ?? null,
    })

    const sessionCookie = auth.generateSessionCookie(
      session.id,
      new Date(session.expiresAt)
    )

    context.res.headers.append("Set-Cookie", sessionCookie.serialize())

    return {
      success: true,
      message: "Verification successful",
    }
  })
