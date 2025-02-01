import { TRPCError } from "@trpc/server";

import type { ValidateVerificationCodeInput } from "@nzc/validators/common";
import { env } from "@nzc/env";
import arcjet, { detectBot, fixedWindow } from "@nzc/security/bun";

import type { AppContext } from "../../trpc";

export async function validateVerificationCode(
  ctx: AppContext,
  input: ValidateVerificationCodeInput,
) {
  const aj = arcjet
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: [],
      }),
    )
    .withRule(
      fixedWindow({
        mode: "LIVE",
        window: "2m",
        max: 5,
      }),
    );

  const decision = await aj.protect(ctx.req);

  if (decision.isDenied() && env.NODE_ENV === "production") {
    if (decision.reason.isBot()) {
      throw new TRPCError({
        message: "Bots are not allowed to perform this action",
        code: "BAD_REQUEST",
      });
    } else {
      throw new TRPCError({
        message:
          "Too many requests. You're temporarily blocked. Please try again after some time.",
        code: "TOO_MANY_REQUESTS",
      });
    }
  }

  const r = await ctx.db.query.securityCodes.findFirst({
    where: (t, { eq, and, gte }) =>
      and(
        eq(t.code, input.code),
        eq(t.identifier, input.identifier),
        gte(t.expiresAt, new Date()),
      ),
  });

  if (!r)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Verification code is invalid or has expired",
    });

  return { success: true };
}
