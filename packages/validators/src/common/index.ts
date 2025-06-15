import { z } from "zod"

export const verificationCodeSchema = z
  .string({ required_error: "Verification code is required" })
  .min(6, { message: "Code is invalid" })
  .max(6, { message: "Code is invalid" })

export const sendVerificationCodeSchema = z.object({
  email: z.string().email({ message: "Email is invalid" }),
})

export const validateVerificationCodeSchema = z.object({
  identifier: z.string(),
  code: verificationCodeSchema,
})

export type SendVerificationCodeSchemaType = z.infer<
  typeof sendVerificationCodeSchema
>
export type ValidateVerificationCodeSchemaType = z.infer<
  typeof validateVerificationCodeSchema
>

export type PickExact<T, K extends keyof T> = {
  [P in K]: T[P]
} & { [P in Exclude<keyof T, K>]?: never }

export * from "./user"
export * from "./file"
export * from "./inventory"
