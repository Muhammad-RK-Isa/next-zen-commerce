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
import { fileDTOSchema } from "../common"
import type { InventoryItemEntity } from "../common/inventory"
import type { StringKeyOf } from "../lib/types"
import { createFilterSchema } from "../lib/utils"

export const dimensionalUnitSchema = z
  .enum(["cm", "m", "in", "ft"])
  .default("cm")
export const weightUnitSchema = z.enum(["g", "kg", "oz", "lb"]).default("g")

export const inventoryItemCreateSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().nullish(),
  quantity: z.number({ coerce: true }).min(0),
  sku: z.string().nullish(),
  material: z.string().nullish(),
  image: fileDTOSchema.optional().refine((file) => file?.type === "image", {
    message: "Only images are allowed",
  }),
  height: z.number({ coerce: true }).nonnegative().nullish(),
  width: z.number({ coerce: true }).nonnegative().nullish(),
  length: z.number({ coerce: true }).nonnegative().nullish(),
  weight: z.number({ coerce: true }).nonnegative().nullish(),
  heightUnit: dimensionalUnitSchema,
  widthUnit: dimensionalUnitSchema,
  lengthUnit: dimensionalUnitSchema,
  weightUnit: weightUnitSchema,
})

export const updateInventoryItemSchema = inventoryItemCreateSchema

export const inventoryItemsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<InventoryItemEntity>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  sku: parseAsString.withDefault(""),
  quantity: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  filters: getFiltersStateParser<InventoryItemEntity>().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  advancedTable: parseAsBoolean.withDefault(false),
}

export const listInventoryItemsInputSchema = z.object({
  page: z.number({ coerce: true }).optional().default(1),
  perPage: z.number({ coerce: true }).optional().default(10),
  sort: z
    .array(
      z.object({
        id: z.string() as z.ZodType<StringKeyOf<InventoryItemEntity>>,
        desc: z.boolean(),
      })
    )
    .default([{ id: "createdAt", desc: true }]),
  name: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  quantity: z.array(z.number({ coerce: true })).default([]),
  createdAt: z.array(z.coerce.number()).default([]),
  joinOperator: z.enum(["and", "or"]).optional().default("and"),
  filters: createFilterSchema<InventoryItemEntity>().default([]),
  advancedTable: z.boolean().optional().default(false),
})

export type InventoryItemCreateSchemaType = z.infer<
  typeof inventoryItemCreateSchema
>
