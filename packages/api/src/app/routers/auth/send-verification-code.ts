import { TRPCError } from "@trpc/server";

import type { SendVerificationCodeInput } from "@nzc/validators/common";
import { generateRandomOTP } from "@nzc/auth/utils";
import { securityCodes } from "@nzc/db/schema";
import { sendEmail } from "@nzc/email";
import { EmailVerificationCode } from "@nzc/email/templates";
import { env } from "@nzc/env";

import type { AppContext } from "../../trpc";

export async function sendVerificationCode(
  ctx: AppContext,
  input: SendVerificationCodeInput,
) {
  const [r] = await ctx.db
    .insert(securityCodes)
    .values({
      identifier: input.email,
      code: generateRandomOTP(),
    })
    .returning()
    .execute();

  if (!r) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }

  await sendEmail({
    from: env.EMAIL_FROM,
    to: input.email,
    subject: `${r.code} is your verification code`,
    react: EmailVerificationCode({
      code: r.code,
      email: input.email,
      expiryDate: 5,
      expiryDateUnit: "minute",
    }),
  });
}
