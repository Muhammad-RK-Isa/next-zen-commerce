import { eq } from "@nzc/db"
import { users } from "@nzc/db/schema"
import arcjet, { detectBot, tokenBucket } from "@nzc/security/bun"
import { updateUserDetailsSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { pickNonNullish } from "~/utils"

export const updateUserDetails = merchAuthedProcedure
  .route({
    method: "PATCH",
    path: "/auth/user",
    tags: ["Auth"],
    summary: "Update user details",
  })
  .input(updateUserDetailsSchema)
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

    const nonNullValues = pickNonNullish(input)

    await context.redis.updateUser(context.user.id, nonNullValues)

    await context.db
      .update(users)
      .set(nonNullValues)
      .where(eq(users.id, context.user.id))

    return {
      success: true,
      message: "User details updated successfully.",
    }
  })
