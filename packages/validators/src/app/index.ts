import { z } from "zod";

export const appAuthSearchParamsSchema = z.object({
  callbackUrl: z.string().optional().default("/"),
  method: z.enum(["email", "phone"]).optional().default("email"),
  identifier: z.string().optional(),
});

export * from "./user";
export * from "./store";
export * from "./file";
