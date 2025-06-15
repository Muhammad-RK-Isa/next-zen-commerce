import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { securityCodes, users } from "@nzc/db/schema"
import { sendEmail } from "@nzc/email"
import { EmailSignInCode } from "@nzc/email/templates"
import arcjet, { protectSignup } from "@nzc/security/bun"
import { signUpSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchPubProcedure } from "~/merchant/orpc"
import { genericOutputSchema, isPostgresError } from "~/utils"

export const signUpEmail = merchPubProcedure
  .route({
    method: "POST",
    path: "/auth/signup/email",
    tags: ["Auth"],
    summary: "Sign up with email",
    description: "Get a verification code for email sign-up",
  })
  .input(signUpSchema)
  .output(genericOutputSchema)
  .errors({
    BAD_REQUEST: {},
    FORBIDDEN: {},
    TOO_MANY_REQUESTS: {},
    CONFLICT: {},
    INTERNAL_SERVER_ERROR: {},
  })
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

    const [_, dbError] = await tryCatch(async () => {
      await context.db.insert(users).values(input).execute()
    })

    if (isPostgresError(dbError) && dbError.errno === "23505") {
      throw new ORPCError("CONFLICT", {
        message: "Account already exists",
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
