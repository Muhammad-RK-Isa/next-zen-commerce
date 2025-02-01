import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { stores } from "@nzc/db/schema";

export const baseStoreSchema = createSelectSchema(stores);

export type StoreEntity = z.infer<typeof baseStoreSchema>;
