import { z } from "zod";

import {
  phoneNumberSchema,
  sendVerificationCodeSchema,
  verificationCodeSchema,
} from "../common";

export const appSignUpEmailPasswordSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, { message: "Name is required" }),
    method: z.enum(["email", "phone"]),
    identifier: z.string(),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
        "Password must be at least 6 characters long and include at least one letter and one digit",
      ),
    confirmPassword: z.string({ required_error: "Retype your password" }),
    verificationCode: verificationCodeSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.identifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.method === "email" ? "Email" : "Phone number"} is required`,
        path: ["identifier"],
      });
      return;
    }

    if (data.method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.identifier)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is invalid",
          path: ["identifier"],
        });
      }
    }

    if (
      data.method === "phone" &&
      !phoneNumberSchema.safeParse(data.identifier).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number",
        path: ["identifier"],
      });
    }
  });

export const appSignInEmailPasswordSchema = z
  .object({
    method: z.enum(["email", "phone"]),
    identifier: z.string(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, { message: "Password is required" }),
  })
  .superRefine((data, ctx) => {
    if (!data.identifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.method === "email" ? "Email" : "Phone number"} is required`,
        path: ["identifier"],
      });
      return;
    }

    if (data.method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.identifier)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is invalid",
          path: ["identifier"],
        });
      }
    }

    if (
      data.method === "phone" &&
      !phoneNumberSchema.safeParse(data.identifier).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number",
        path: ["identifier"],
      });
    }
  });

export const appLookUpAccountSchema = sendVerificationCodeSchema;

export type AppSignInEmailPasswordInput = z.infer<
  typeof appSignInEmailPasswordSchema
>;
export type AppSignUpEmailPasswordInput = z.infer<
  typeof appSignUpEmailPasswordSchema
>;
export type AppLookUpAccountInput = z.infer<typeof appLookUpAccountSchema>;
