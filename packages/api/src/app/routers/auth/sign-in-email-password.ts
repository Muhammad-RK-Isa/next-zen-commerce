import { TRPCError } from "@trpc/server";

import type { AppSignInEmailPasswordInput } from "@nzc/validators/app";
import { auth } from "@nzc/auth";
import { verifyPasswordHash } from "@nzc/auth/utils";
import { env } from "@nzc/env";
import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
} from "@nzc/security/bun";

import type { AppContext } from "../../trpc";

export async function signInEmailPassword(
  ctx: AppContext,
  input: AppSignInEmailPasswordInput,
) {
  if (input.method === "email") {
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
          interval: "2m",
        },
      }),
    );

    const decision = await aj.protect(ctx.req, {
      email: input.identifier,
    });

    if (decision.isDenied() && env.NODE_ENV === "production") {
      if (decision.reason.isEmail()) {
        throw new TRPCError({
          message: "Email is invalid",
          code: "BAD_REQUEST",
        });
      } else if (decision.reason.isBot()) {
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
  } else {
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
          max: 10,
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
  }

  const user = await ctx.db.query.users.findFirst({
    where: (t, { eq }) =>
      input.method === "email"
        ? eq(t.email, input.identifier)
        : eq(t.phone, input.identifier),
  });

  if (!user)
    throw new TRPCError({
      message: "Account doesn't exist",
      code: "NOT_FOUND",
    });

  if (!user.password)
    throw new TRPCError({
      message: "Incorrect email or password",
      code: "UNAUTHORIZED",
    });

  const validPassword = await verifyPasswordHash(input.password, user.password);

  if (!validPassword)
    throw new TRPCError({
      message: `Incorrect ${input.method} or password`,
      code: "UNAUTHORIZED",
    });

  const session = await auth.createUserSession({
    flags: { isTwoFactorVerified: false },
    //! Caution: Never spread the user object, it will cause the session to have the password field as well.
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      avatar: user.avatar,
      role: user.role,
    },
  });

  const sessionCookie = auth.generateSessionCookie(session.id).serialize();

  ctx.resHeaders.append("Set-Cookie", sessionCookie);

  return { success: true };
}
