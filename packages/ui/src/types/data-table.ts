import type { DataTableConfig } from "@nzc/ui/config/data-table"
import type { FilterItemSchema } from "@nzc/ui/lib/parsers"
import type { ColumnSort, Row, RowData } from "@tanstack/react-table"
import type React from "react"

export interface Option {
  label: string
  value: string
  count?: number
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
}

export type FilterOperator = DataTableConfig["operators"][number]
export type FilterVariant = DataTableConfig["filterVariants"][number]
export type JoinOperator = DataTableConfig["joinOperators"][number]

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>
}

export interface DataTableRowAction<TData> {
  row: Row<TData>
  variant: "update" | "delete" | "preview"
}

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    placeholder?: string
    variant?: FilterVariant
    options?: Option[]
    range?: [number, number]
    unit?: string
    icon?: React.FC<React.SVGProps<SVGSVGElement>>
  }
}

export type * from "@tanstack/react-table"
