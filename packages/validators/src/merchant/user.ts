import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { users } from "@nzc/db/schema"

export const baseUserSchema = createSelectSchema(users)

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
})

export const signUpSchema = signInSchema.extend({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long." }),
})

export const verificationCodeSchema = z.object({
  code: z
    .string({ required_error: "Verification code is required" })
    .min(6, { message: "Code is invalid" })
    .max(6, { message: "Code is invalid" }),
  identifier: z.string().email(),
})

export const updateUserDetailsSchema = baseUserSchema.pick({
  name: true,
  avatar: true,
})

export type UserEntity = z.infer<typeof baseUserSchema>
export type SignInSchemaType = z.infer<typeof signInSchema>
export type SignUpSchemaType = z.infer<typeof signUpSchema>
export type VerificationCodeSchemaType = z.infer<typeof verificationCodeSchema>
