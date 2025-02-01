import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { files } from "@nzc/db/schema";

export const baseFileSchema = createSelectSchema(files);

export const minimalFile = baseFileSchema.pick({
  id: true,
  name: true,
  url: true,
  type: true,
});

export type FileEntity = z.infer<typeof baseFileSchema>;
export type MinimalFile = z.infer<typeof minimalFile>;
