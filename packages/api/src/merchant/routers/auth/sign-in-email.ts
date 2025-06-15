import { securityCodes } from "@nzc/db/schema"
import { sendEmail } from "@nzc/email"
import { EmailSignInCode } from "@nzc/email/templates"
import arcjet, { protectSignup } from "@nzc/security/bun"
import { signInSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchPubProcedure } from "~/merchant/orpc"
import { genericOutputSchema } from "~/utils"

export const signInEmail = merchPubProcedure
  .route({
    method: "POST",
    path: "/auth/signin/email",
    tags: ["Auth"],
    summary: "Sign in with email",
    description: "Get a verification code for email sign-in",
  })
  .errors({
    NOT_FOUND: {},
    FORBIDDEN: {},
    INTERNAL_SERVER_ERROR: {},
    BAD_REQUEST: {},
    TOO_MANY_REQUESTS: {},
  })
  .output(genericOutputSchema)
  .input(signInSchema)
  .handler(async ({ context, input }) => {
    const aj = arcjet.withRule(
      protectSignup({
        email: {
          mode: "LIVE",
          block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
        },
        bots: {
          mode: "LIVE",
          allow: [],
        },
        rateLimit: {
          mode: "LIVE",
          max: 10,
          interval: "5m",
        },
      })
    )

    const decision = await aj.protect(context.req, {
      email: input.email,
    })

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Email is invalid",
        })
      }
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

    const user = await context.db.query.users.findFirst({
      where: (t, { and, eq, isNull }) =>
        and(eq(t.email, input.email), isNull(t.deletedAt)),
    })

    if (!user) {
      throw new ORPCError("NOT_FOUND", {
        message: "User not registered",
      })
    }

    const [securityCode] = await context.db
      .insert(securityCodes)
      .values({
        identifier: input.email,
      })
      .returning()

    if (!securityCode) {
      throw new ORPCError("INTERNAL_SERVER_ERROR")
    }

    await sendEmail({
      template: EmailSignInCode({
        code: securityCode.code,
        email: input.email,
        expiryDate: 10,
        expiryDateUnit: "minute",
      }),
      subject: `${securityCode.code} is your authentication code`,
      to: input.email,
    })

    return {
      success: true,
      message: "Email sent successfully",
    }
  })
