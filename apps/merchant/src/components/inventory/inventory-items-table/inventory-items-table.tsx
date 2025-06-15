import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { DataTable } from "@nzc/ui/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@nzc/ui/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterMenu } from "@nzc/ui/components/data-table/data-table-filter-menu"
import { DataTableSortList } from "@nzc/ui/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@nzc/ui/components/data-table/data-table-toolbar"
import { useDataTable } from "@nzc/ui/hooks/use-data-table"
import type { DataTableRowAction } from "@nzc/ui/types/data-table"
import { inventoryItemsSearchParamsParsers } from "@nzc/validators/merchant"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { useQueryStates } from "nuqs"
import React from "react"
import { InventoryItemsTableActionBar } from "./inventory-items-action-bar"
import { getInventoryItemsTableColumns } from "./inventory-items-table-columns"

export function InventoryItemsTable() {
  const { orpc } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })

  const [search] = useQueryStates(inventoryItemsSearchParamsParsers, {
    clearOnDefault: true,
  })

  const { data, isPending } = useQuery(
    orpc.inventory.list.queryOptions({
      input: search,
    })
  )

  const { data: quantityRange } = useSuspenseQuery(
    orpc.inventory.getQuantityRange.queryOptions()
  )

  const [_, setRowAction] = React.useState<DataTableRowAction<
    MerchantRouterOutputs["inventory"]["list"]["data"][number]
  > | null>(null)

  const columns = React.useMemo(
    () =>
      getInventoryItemsTableColumns({
        setRowAction,
        quantityRange: [quantityRange.min, quantityRange.max],
      }),
    []
  )

  const enableAdvancedFilter = search.advancedTable

  const { table, shallow, throttleMs, debounceMs } = useDataTable({
    columns,
    data: data?.data ?? [],
    pageCount: data?.pageCount ?? 0,
    enableAdvancedFilter,
    enableColumnFilters: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: {
        left: ["select", "name"],
        right: ["actions"],
      },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
        isLoading={isPending}
        actionBar={<InventoryItemsTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} align="start" />
            <DataTableFilterMenu
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
            />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
    </>
  )
}
