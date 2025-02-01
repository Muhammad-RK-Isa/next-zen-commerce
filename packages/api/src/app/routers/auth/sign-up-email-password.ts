import { TRPCError } from "@trpc/server";

import type { AppSignUpEmailPasswordInput } from "@nzc/validators/app";
import { auth } from "@nzc/auth";
import { hashPassword } from "@nzc/auth/utils";
import { eq } from "@nzc/db";
import { securityCodes, users } from "@nzc/db/schema";
import { isPostgresError } from "@nzc/db/utils";
import { env } from "@nzc/env";
import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
} from "@nzc/security/bun";

import type { AppContext } from "../../trpc";

export async function signUpEmailPassword(
  ctx: AppContext,
  input: AppSignUpEmailPasswordInput,
) {
  try {
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

    const newUser = await ctx.db.transaction(async (tx) => {
      const validVerificationCode = await tx.query.securityCodes.findFirst({
        where: (t, { eq, and, gte }) =>
          and(
            eq(t.identifier, input.identifier),
            eq(t.code, input.verificationCode),
            gte(t.expiresAt, new Date()),
          ),
      });

      if (!validVerificationCode)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Verification code is invalid or has expired",
        });

      const hashedPassword = await hashPassword(input.password);

      const [newUser] = await tx
        .insert(users)
        .values({
          name: input.name,
          ...(input.method === "email"
            ? { email: input.identifier }
            : { phone: input.identifier }),
          password: hashedPassword,
          emailVerified: input.method === "email",
          phoneVerified: input.method === "phone",
        })
        .returning();

      if (!newUser)
        throw new TRPCError({
          message: "Something went wrong!",
          code: "INTERNAL_SERVER_ERROR",
        });

      await tx
        .delete(securityCodes)
        .where(eq(securityCodes.code, input.verificationCode))
        .execute();

      return newUser;
    });

    const session = await auth.createUserSession({
      //! Caution: Never spread the user object, it will cause the session to have the password field as well.
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        emailVerified: newUser.emailVerified,
        phoneVerified: newUser.phoneVerified,
        avatar: newUser.avatar,
        role: newUser.role,
      },
      flags: {
        isTwoFactorVerified: true,
      },
    });

    const sessionCookie = auth.generateSessionCookie(session.id).serialize();

    ctx.resHeaders.append("Set-Cookie", sessionCookie);

    return { success: true };
  } catch (error) {
    console.log(error);
    if (isPostgresError(error) && error.code === "23505") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already exists",
      });
    }
  }
}
