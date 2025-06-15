import type {
  ExtendedColumnFilter,
  FilterOperator,
  FilterVariant,
} from "@nzc/ui/types/data-table"
import type { Column, Table } from "@tanstack/react-table"

import { dataTableConfig } from "@nzc/ui/config/data-table"
import type React from "react"

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
  table,
  scrollLeft = 0,
  scrollRight = 0,
}: {
  column: Column<TData>
  withBorder?: boolean
  table?: Table<TData>
  scrollLeft?: number
  scrollRight?: number
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right")

  const shouldShowShadow =
    !withBorder && table
      ? (() => {
          const allColumns = table
            .getAllColumns()
            .filter((col) => col.getIsVisible())
          const unpinnedColumns = allColumns.filter((col) => !col.getIsPinned())

          if (unpinnedColumns.length === 0) {
            return false
          }

          if (isPinned === "left" && isLastLeftPinnedColumn) {
            return scrollLeft > 0
          }

          if (isPinned === "right" && isFirstRightPinnedColumn) {
            return scrollRight > 0
          }

          return false
        })()
      : false

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px var(--border) inset"
          : undefined
      : shouldShowShadow
        ? isLastLeftPinnedColumn
          ? "inset -1px 0 0 0 var(--border), 2px 0 4px -2px var(--border)"
          : isFirstRightPinnedColumn
            ? "inset 1px 0 0 0 var(--border), -2px 0 4px -2px var(--border)"
            : undefined
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "var(--background)" : undefined,
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export function getFilterOperators(filterVariant: FilterVariant) {
  const operatorMap: Record<
    FilterVariant,
    { label: string; value: FilterOperator }[]
  > = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    range: dataTableConfig.numericOperators,
    date: dataTableConfig.dateOperators,
    dateRange: dataTableConfig.dateOperators,
    boolean: dataTableConfig.booleanOperators,
    select: dataTableConfig.selectOperators,
    multiSelect: dataTableConfig.multiSelectOperators,
  }

  return operatorMap[filterVariant] ?? dataTableConfig.textOperators
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
  const operators = getFilterOperators(filterVariant)

  return operators[0]?.value ?? (filterVariant === "text" ? "iLike" : "eq")
}

export function getValidFilters<TData>(
  filters: ExtendedColumnFilter<TData>[]
): ExtendedColumnFilter<TData>[] {
  return filters.filter(
    (filter) =>
      filter.operator === "isEmpty" ||
      filter.operator === "isNotEmpty" ||
      (Array.isArray(filter.value)
        ? filter.value.length > 0
        : filter.value !== "" &&
          filter.value !== null &&
          filter.value !== undefined)
  )
}
