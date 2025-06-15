import { files } from "@nzc/db/schema"
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@nzc/ui/lib/parsers"
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs"
import { z } from "zod"
import { type FileEntity, baseFileSchema } from "../common"
import type { StringKeyOf } from "../lib/types"
import { createFilterSchema } from "../lib/utils"

export const uploadFileFromURLSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .url({ message: "Invalid URL" }),
})

export const updateFileSchema = baseFileSchema.pick({ id: true }).extend({
  name: z
    .string({ required_error: "File name is required" })
    .min(1, { message: "File name is required" }),
  alt: z.string().nullish(),
  description: z.string().nullish(),
})

export const filesSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: getSortingStateParser<FileEntity>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  type: parseAsArrayOf(baseFileSchema.shape.type).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  filters: getFiltersStateParser<FileEntity>().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  advancedTable: parseAsBoolean.withDefault(false),
}

export const listFilesInputSchema = z.object({
  page: z.number({ coerce: true }).optional().default(1),
  perPage: z.number({ coerce: true }).optional().default(10),
  sort: z
    .array(
      z.object({
        id: z.string() as z.ZodType<StringKeyOf<FileEntity>>,
        desc: z.boolean(),
      })
    )
    .default([{ id: "createdAt", desc: true }]),
  name: z.string().optional().default(""),
  type: z.array(z.enum(files.type.enumValues)).optional().default([]),
  createdAt: z.array(z.coerce.number()).default([]),
  joinOperator: z.enum(["and", "or"]).optional().default("and"),
  filters: createFilterSchema<FileEntity>().default([]),
  advancedTable: z.boolean().optional().default(false),
})

export type UpdateFileSchemaType = z.infer<typeof updateFileSchema>
export type UploadFileFromURLSchemaType = z.infer<
  typeof uploadFileFromURLSchema
>
