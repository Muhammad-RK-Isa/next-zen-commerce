import { createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

import { files } from "@nzc/db/schema"

export const baseFileSchema = createSelectSchema(files)

export const fileTypeSchema = baseFileSchema.shape.type

// File Data Transfer Object Schema
export const fileDTOSchema = baseFileSchema.pick({
  id: true,
  name: true,
  type: true,
  url: true,
})

export type FileEntity = z.infer<typeof baseFileSchema>
export type FileDTO = z.infer<typeof fileDTOSchema>
export type FileType = z.infer<typeof fileTypeSchema>
