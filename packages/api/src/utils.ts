import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  not,
  notIlike,
  notInArray,
  or,
} from "@nzc/db"
import type { AnyColumn, SQL, Table } from "@nzc/db/types"
import { isEmpty } from "@nzc/db/utils"
import type { JoinOperator } from "@nzc/ui/types/data-table"
import type { ExtendedColumnFilter } from "@nzc/ui/types/data-table"
import { addDays, endOfDay, startOfDay } from "date-fns"
import { z } from "zod"

export function isPostgresError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "constraint" in error &&
    "detail" in error &&
    "schema" in error &&
    "table" in error &&
    "errno" in error
  )
}

type NonNullable<T> = T extends null | undefined ? never : T

export function pickNonNullish<T extends Record<string, unknown>>(
  input: T
): {
  [K in keyof T]-?: NonNullable<T[K]>
} {
  // biome-ignore lint/suspicious/noExplicitAny: This is necessary to avoid type errors
  const result: any = {}

  for (const key in input) {
    if (input[key] != null) {
      result[key] = input[key]
    }
  }

  return result
}

export const genericOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export function filterColumns<T extends Table>({
  table,
  filters,
  joinOperator,
}: {
  table: T
  filters: ExtendedColumnFilter<T["$inferSelect"]>[]
  joinOperator: JoinOperator
}): SQL | undefined {
  const joinFn = joinOperator === "and" ? and : or

  const conditions = filters.map((filter) => {
    const column = getColumn(table, filter.id)

    switch (filter.operator) {
      case "iLike":
        return filter.variant === "text" && typeof filter.value === "string"
          ? ilike(column, `%${filter.value}%`)
          : undefined

      case "notILike":
        return filter.variant === "text" && typeof filter.value === "string"
          ? notIlike(column, `%${filter.value}%`)
          : undefined

      case "eq": {
        if (column.dataType === "boolean" && typeof filter.value === "string") {
          return eq(column, filter.value === "true")
        }
        if (filter.variant === "date" || filter.variant === "dateRange") {
          const date = new Date(Number(filter.value))
          date.setHours(0, 0, 0, 0)
          const end = new Date(date)
          end.setHours(23, 59, 59, 999)
          return and(gte(column, date), lte(column, end))
        }
        return eq(column, filter.value)
      }
      case "ne": {
        if (column.dataType === "boolean" && typeof filter.value === "string") {
          return ne(column, filter.value === "true")
        }
        if (filter.variant === "date" || filter.variant === "dateRange") {
          const date = new Date(Number(filter.value))
          date.setHours(0, 0, 0, 0)
          const end = new Date(date)
          end.setHours(23, 59, 59, 999)
          return or(lt(column, date), gt(column, end))
        }
        return ne(column, filter.value)
      }
      case "inArray": {
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value)
        }
        return undefined
      }
      case "notInArray": {
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value)
        }
        return undefined
      }

      case "lt":
        return filter.variant === "number" || filter.variant === "range"
          ? lt(column, filter.value)
          : filter.variant === "date" && typeof filter.value === "string"
            ? lt(
                column,
                (() => {
                  const date = new Date(Number(filter.value))
                  date.setHours(23, 59, 59, 999)
                  return date
                })()
              )
            : undefined

      case "lte":
        return filter.variant === "number" || filter.variant === "range"
          ? lte(column, filter.value)
          : filter.variant === "date" && typeof filter.value === "string"
            ? lte(
                column,
                (() => {
                  const date = new Date(Number(filter.value))
                  date.setHours(23, 59, 59, 999)
                  return date
                })()
              )
            : undefined

      case "gt":
        return filter.variant === "number" || filter.variant === "range"
          ? gt(column, filter.value)
          : filter.variant === "date" && typeof filter.value === "string"
            ? gt(
                column,
                (() => {
                  const date = new Date(Number(filter.value))
                  date.setHours(0, 0, 0, 0)
                  return date
                })()
              )
            : undefined

      case "gte":
        return filter.variant === "number" || filter.variant === "range"
          ? gte(column, filter.value)
          : filter.variant === "date" && typeof filter.value === "string"
            ? gte(
                column,
                (() => {
                  const date = new Date(Number(filter.value))
                  date.setHours(0, 0, 0, 0)
                  return date
                })()
              )
            : undefined

      case "isBetween": {
        if (
          (filter.variant === "date" || filter.variant === "dateRange") &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          return and(
            filter.value[0]
              ? gte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[0]))
                    date.setHours(0, 0, 0, 0)
                    return date
                  })()
                )
              : undefined,
            filter.value[1]
              ? lte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[1]))
                    date.setHours(23, 59, 59, 999)
                    return date
                  })()
                )
              : undefined
          )
        }

        if (
          (filter.variant === "number" || filter.variant === "range") &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          const firstValue =
            filter.value[0] && filter.value[0].trim() !== ""
              ? Number(filter.value[0])
              : null
          const secondValue =
            filter.value[1] && filter.value[1].trim() !== ""
              ? Number(filter.value[1])
              : null

          if (firstValue === null && secondValue === null) {
            return undefined
          }

          if (firstValue !== null && secondValue === null) {
            return eq(column, firstValue)
          }

          if (firstValue === null && secondValue !== null) {
            return eq(column, secondValue)
          }

          return and(
            firstValue !== null ? gte(column, firstValue) : undefined,
            secondValue !== null ? lte(column, secondValue) : undefined
          )
        }
        return undefined
      }
      case "isRelativeToToday": {
        if (
          (filter.variant === "date" || filter.variant === "dateRange") &&
          typeof filter.value === "string"
        ) {
          const today = new Date()
          const [amount, unit] = filter.value.split(" ") ?? []
          let startDate: Date
          let endDate: Date

          if (!amount || !unit) {
            return undefined
          }

          switch (unit) {
            case "days":
              {
                startDate = startOfDay(addDays(today, Number.parseInt(amount)))
                endDate = endOfDay(startDate)
              }
              break
            case "weeks": {
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 7)
              )
              endDate = endOfDay(addDays(startDate, 6))
              break
            }
            case "months": {
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 30)
              )
              endDate = endOfDay(addDays(startDate, 29))
              break
            }
            default:
              return undefined
          }

          return and(gte(column, startDate), lte(column, endDate))
        }
        return undefined
      }

      case "isEmpty":
        return isEmpty(column)

      case "isNotEmpty":
        return not(isEmpty(column))

      default:
        throw new Error(`Unsupported operator: ${filter.operator}`)
    }
  })

  const validConditions = conditions.filter(
    (condition) => condition !== undefined
  )

  return validConditions.length > 0 ? joinFn(...validConditions) : undefined
}

export function getColumn<T extends Table>(
  table: T,
  columnKey: keyof T
): AnyColumn {
  return table[columnKey] as AnyColumn
}
