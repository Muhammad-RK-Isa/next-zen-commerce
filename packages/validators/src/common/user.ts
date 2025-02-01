import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@nzc/db/schema";

export const baseUserSchema = createSelectSchema(users);

export type UserEntity = z.infer<typeof baseUserSchema>;
