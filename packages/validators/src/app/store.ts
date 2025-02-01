import { z } from "zod";

export const storeCreateSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, { message: "Name is required" }),
  handle: z
    .string({
      required_error: "Handle is required",
    })
    .min(1, { message: "Handle is required" }),
});

export type StoreCreateSchemaType = z.infer<typeof storeCreateSchema>;
