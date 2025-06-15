import { dataTableConfig } from "@nzc/ui/config/data-table"
import type { ExtendedColumnFilter } from "@nzc/ui/types/data-table"
import { z } from "zod"
import type { StringKeyOf } from "./types"

/**
 * Creates a typed filter schema for a given data type
 *
 * @returns A Zod schema for the filters array that is properly typed for the data
 */
export function createFilterSchema<TData>() {
  return z
    .array(
      z.object({
        id: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
        variant: z.enum(dataTableConfig.filterVariants),
        operator: z.enum(dataTableConfig.operators),
        filterId: z.string(),
      }) as unknown as z.ZodType<ExtendedColumnFilter<TData>>
    )
    .default([])
}

/**
 * Creates a typed sorting schema for a given data type
 *
 * @returns A Zod schema for the sorting array that is properly typed for the data
 */
export function createSortingSchema<TData>() {
  return z.array(
    z.object({
      id: z.string() as unknown as z.ZodType<StringKeyOf<TData>>,
      desc: z.boolean(),
    })
  )
}
