import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(
    /^\+[1-9]\d{1,14}$/,
    "Phone number must start with a '+' followed by 1-15 digits.",
  )
  .max(24, "Phone number must not exceed 24 characters, including formatting.");

export const verificationCodeSchema = z
  .string({ required_error: "Verification code is required" })
  .min(6, { message: "Code is invalid" })
  .max(6, { message: "Code is invalid" });

export const sendVerificationCodeSchema = z.object({
  email: z.string().email({ message: "Email is invalid" }),
});

export const validateVerificationCodeSchema = z.object({
  identifier: z.string(),
  code: verificationCodeSchema,
});

export type SendVerificationCodeInput = z.infer<
  typeof sendVerificationCodeSchema
>;
export type ValidateVerificationCodeInput = z.infer<
  typeof validateVerificationCodeSchema
>;

export * from "./user";
export * from "./store";
export * from "./file";
