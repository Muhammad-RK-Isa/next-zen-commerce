import type { TRPCRouterRecord } from "@trpc/server";

import {
  appLookUpAccountSchema,
  appSignInEmailPasswordSchema,
  appSignUpEmailPasswordSchema,
} from "@nzc/validators/app";
import {
  sendVerificationCodeSchema,
  validateVerificationCodeSchema,
} from "@nzc/validators/common";

import { protectedAppProcedure, publicAppProcedure } from "../../trpc";
import { lookUpAccount } from "./look-up-existing-account";
import { sendVerificationCode } from "./send-verification-code";
import { signInEmailPassword } from "./sign-in-email-password";
import { signOut } from "./sign-out";
import { signUpEmailPassword } from "./sign-up-email-password";
import { validateVerificationCode } from "./validate-verification-code";

export const authRouter = {
  session: publicAppProcedure.query(({ ctx }) => {
    return {
      ...ctx.session,
      user: ctx.user,
    };
  }),
  signInEmailPassword: publicAppProcedure
    .input(appSignInEmailPasswordSchema)
    .mutation(({ ctx, input }) => signInEmailPassword(ctx, input)),
  signUpEmailPassword: publicAppProcedure
    .input(appSignUpEmailPasswordSchema)
    .mutation(({ ctx, input }) => signUpEmailPassword(ctx, input)),
  validateVerificationCode: publicAppProcedure
    .input(validateVerificationCodeSchema)
    .mutation(({ ctx, input }) => validateVerificationCode(ctx, input)),
  lookUpAccount: publicAppProcedure
    .input(appLookUpAccountSchema)
    .mutation(({ ctx, input }) => lookUpAccount(ctx, input)),
  sendVerificationCode: publicAppProcedure
    .input(sendVerificationCodeSchema)
    .mutation(({ ctx, input }) => sendVerificationCode(ctx, input)),
  signOut: protectedAppProcedure.mutation(({ ctx }) => signOut(ctx)),
} satisfies TRPCRouterRecord;
