import type {
  AnyColumn,
  Column,
  GetColumnData,
  SQL,
  SelectedFields,
  Table,
} from "drizzle-orm"
import { and, is, not, sql } from "drizzle-orm"
import type { AnyPgColumn } from "drizzle-orm/pg-core"
import { PgTimestampString, timestamp } from "drizzle-orm/pg-core"
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types"
import { v1 as uuidv1, v4 as uuidv4 } from "uuid"

import type { QueryBuilderOpts } from "./types"

export function generateId({ prefix }: { prefix?: string } = {}) {
  return `${prefix ? `${prefix}_` : ""}${uuidv4()}`
}

export function generateOrderId(): string {
  const timestamp = uuidv1()
  const randomPart = uuidv4()

  const timestampPart = timestamp.split("-")[0]
  const randomPartSegment = randomPart.split("-")[1]

  const orderId = `ORDER-${timestampPart}-${randomPartSegment}`.toUpperCase()
  return orderId
}

/**
 * Generates a unique random slug using UUID with only lowercase letters
 * @returns A unique 8-character slug string with only lowercase letters
 */
export function generateUniqueSlug() {
  const uuid = uuidv4()

  const uuidWithoutHyphens = uuid.replace(/-/g, "")

  let lettersOnly = ""
  for (
    let i = 0;
    i < uuidWithoutHyphens.length && lettersOnly.length < 8;
    i++
  ) {
    const char = uuidWithoutHyphens.charAt(i)

    const num = Number.parseInt(char, 16)

    const letter = String.fromCharCode(97 + (num % 26))
    lettersOnly += letter
  }

  return lettersOnly.substring(0, 8)
}

export function generateNumericCode(length: number): string {
  if (length <= 0) {
    throw new Error("Length must be a positive integer.")
  }

  const min = 10 ** (length - 1)
  const max = 10 ** length - 1

  const code = Math.floor(Math.random() * (max - min + 1)) + min
  return code.toString()
}

export function generateExpiryDate(
  amount: number,
  unit: "m" | "h" | "d" | "mo" | "y" = "m"
): Date {
  if (amount <= 0) {
    throw new Error("Amount must be a positive number.")
  }

  const codeExpiryDate = new Date()

  switch (unit) {
    case "h":
      codeExpiryDate.setHours(codeExpiryDate.getHours() + amount)
      break
    case "d":
      codeExpiryDate.setDate(codeExpiryDate.getDate() + amount)
      break
    case "mo":
      codeExpiryDate.setMonth(codeExpiryDate.getMonth() + amount)
      break
    case "y":
      codeExpiryDate.setFullYear(codeExpiryDate.getFullYear() + amount)
      break
    default:
      codeExpiryDate.setMinutes(codeExpiryDate.getMinutes() + amount)
      break
  }
  return codeExpiryDate
}

export const lifecycleDates = {
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .default(sql`null`)
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", {
    mode: "date",
    withTimezone: true,
  }),
}

export function takeFirst<TData>(items: TData[]) {
  return items.at(0)
}

/**
 * Takes the first item from an array or returns null if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array or null.
 */
export function takeFirstOrNull<TData>(items: TData[]) {
  return takeFirst(items) ?? null
}

/**
 * Takes the first item from an array or throws an error if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 * @throws An error if the array is empty.
 */
export function takeFirstOrThrow<TData>(items: TData[]) {
  const first = takeFirst(items)

  if (!first) {
    throw new Error("First item not found")
  }

  return first
}

/**
 * Coalesces a value to a default value.
 *
 * @param value - The value to coalesce.
 * @param defaultValue - The default value to return if the value is null.
 * @returns A sql coalesce statement.
 */
export function coalesce<TData>(
  value: SQL.Aliased<TData> | SQL<TData>,
  defaultValue: SQL<TData>
) {
  return sql<TData>`coalesce(${value}, ${defaultValue})`
}

/**
 * Builds a json object from a shape.
 *
 * @param shape - The shape of the object to build.
 * @returns A sql json_build_object statement.
 */
export function jsonBuildObject<TFields extends SelectedFields<Column, Table>>(
  shape: TFields
) {
  const chunks: SQL[] = []

  for (const [key, value] of Object.entries(shape)) {
    if (chunks.length > 0) {
      chunks.push(sql.raw(","))
    }

    chunks.push(sql.raw(`'${key}',`))

    // json_build_object formats to ISO 8601 ...
    if (is(value, PgTimestampString)) {
      chunks.push(sql`timezone('UTC', ${value})`)
    } else {
      chunks.push(sql`${value}`)
    }
  }

  return sql<
    SelectResultFields<TFields>
  >`json_build_object(${sql.join(chunks)})`
}

/**
 * ggregates an array of values into a single json array.
 *
 * @param shape - The shape of the object to aggregate.
 * @param options - The options to pass to the aggregate function.
 * @returns A SQL json_agg statement.
 */
export function jsonAgg<Column extends AnyColumn>(
  column: Column,
  opts?: QueryBuilderOpts
) {
  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``

  const aggregateFunction = opts?.distinct
    ? sql`json_agg(distinct ${sql`${column}`} ${orderBy})`
    : sql`json_agg(${sql`${column}`} ${orderBy})`

  const where = opts?.nullish ? sql`true` : sql`${column} is not null`

  return coalesce<GetColumnData<Column, "raw">[]>(
    sql`${aggregateFunction} filter (where ${where})`,
    sql`'[]'::json`
  )
}

/**
 *  Aggregates an array of objects into a single json object.
 *
 * @param shape - The shape of the object to build.
 * @param options - The options to pass to the aggregate function.
 * @returns A SQL json_agg statement.
 */
export function jsonAggBuildObject<
  TFields extends SelectedFields<Column, Table>,
  Column extends AnyColumn,
>(shape: TFields, opts?: Omit<QueryBuilderOpts, "distinct">) {
  const nullishWhere = opts?.nullish
    ? sql`true`
    : sql`${sql.join(
        Object.values(shape).map((value) => sql`${value} is not null`),
        sql` and `
      )}`

  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``
  const where = opts?.where ? and(opts.where, nullishWhere) : nullishWhere

  return coalesce<SelectResultFields<TFields>[]>(
    sql`json_agg(${jsonBuildObject(shape)}${orderBy}) filter (where ${where})`,
    sql`'[]'::json`
  )
}

/**
 * Aggregates an array of values into a single array.
 *
 * @param column - The column to aggregate.
 * @param opts - The options to pass to the aggregate function.
 * @returns A SQL array_agg statement.
 */

export function arrayAgg<Column extends AnyColumn>(
  column: Column,
  opts?: QueryBuilderOpts
) {
  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``

  const aggregateFunction = opts?.distinct
    ? sql`array_agg(distinct ${sql`${column}`} ${orderBy})`
    : sql`array_agg(${sql`${column}`} ${orderBy})`

  return sql`coalesce(nullif(${aggregateFunction}, '{}'), array[]::${column.dataType}[])`
}

/**
 *  Combines array_agg with jsonb_build_object for more flexible aggregation.
 *
 * @param shape - An object representing the shape of the jsonb to build
 * @param opts - Options for aggregation (distinct, where, orderBy)
 * @returns A SQL statement for array_agg with jsonb_build_object
 */
export function arrayAggBuildObject<
  TFields extends Record<string, AnyColumn | SQL>,
>(fields: TFields, options?: QueryBuilderOpts) {
  const jsonbBuildObject = sql`jsonb_build_object(${sql.join(
    Object.entries(fields).flatMap(([key, value]) => [
      sql.raw(`'${key}'`),
      value,
    ]),
    sql`, `
  )})`

  const distinctClause = options?.distinct ? sql`distinct ` : sql``
  const orderByClause = options?.orderBy
    ? sql` order by ${options.orderBy}`
    : sql``
  const whereClause = options?.where
    ? sql` filter (where ${options.where})`
    : sql``

  return sql<SelectResultFields<TFields>[]>`
    coalesce(
      array_agg(${distinctClause}${jsonbBuildObject}${orderByClause})${whereClause},
      array[]::jsonb[]
    )
  `
}

/**
 * Creates a SQL case statement for provided cases and an else value.
 *
 * @param cases - An array of objects with a `when` property and a `then` property.
 * @param elseValue - The value to return if no case matches.
 * @returns A SQL case statement.
 */
export function caseWhen<TColumn extends Column>(
  cases: { when: SQL | undefined; then: Column }[],
  elseValue: TColumn
) {
  const chunks: SQL[] = []

  for (const { when, then } of cases) {
    chunks.push(sql`when ${when} then ${then}`)
  }

  chunks.push(sql`else ${elseValue}`)

  return sql<TColumn["_"]["dataType"]>`case ${sql.join(chunks)} end`
}

/**
 * Composes an array of columns into a single st.
 *
 * @param values - The values to compose.
 * @param separator - The separator to use between the ids (default: "").
 * @returns A sql statement representing the composite column.
 */
export function compose<TColumn extends Column>(
  columns: TColumn[],
  separator = ""
) {
  const chunks = columns.map((column) => sql`${column}::text`)

  return sql<
    TColumn["_"]["dataType"]
  >`(${sql.join(chunks, sql` || ${separator} || `)})`
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is empty, false otherwise.
 */
export function isEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return sql<boolean>`
    case
      when ${column} is null then true
      when ${column} = '' then true
      when ${column}::text = '[]' then true
      when ${column}::text = '{}' then true
      else false
    end
  `
}

/**
 * Checks if a value is not empty (not null, not undefined, not empty string, not empty array, and not empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is not empty, false otherwise.
 */
export function isNotEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return not(isEmpty(column))
}

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`
}
