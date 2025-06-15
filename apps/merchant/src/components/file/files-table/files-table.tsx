import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { DataTable } from "@nzc/ui/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@nzc/ui/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterMenu } from "@nzc/ui/components/data-table/data-table-filter-menu"
import { DataTableSortList } from "@nzc/ui/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@nzc/ui/components/data-table/data-table-toolbar"
import { useDataTable } from "@nzc/ui/hooks/use-data-table"
import type { DataTableRowAction } from "@nzc/ui/types/data-table"
import { filesSearchParamsParsers } from "@nzc/validators/merchant"
import { useQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { useQueryStates } from "nuqs"
import React from "react"
import { FileUploadModal } from "../file-uploader-modal"
import { FileDeleteModal } from "./file-delete-modal"
import { FilePreviewModal } from "./file-preview-modal"
import { FileUpdateSheet } from "./file-update-sheet"
import { FilesTableActionBar } from "./files-table-action-bar"
import { getFilesTableColumns } from "./files-table-columns"

export function FilesTable() {
  const { orpc } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })

  const [search] = useQueryStates(filesSearchParamsParsers, {
    clearOnDefault: true,
  })

  const { data, isPending } = useQuery(
    orpc.file.list.queryOptions({
      input: search,
    })
  )

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<
    MerchantRouterOutputs["file"]["list"]["data"][number]
  > | null>(null)

  const columns = React.useMemo(
    () =>
      getFilesTableColumns({
        setRowAction,
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
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
        isLoading={isPending}
        actionBar={<FilesTableActionBar table={table} />}
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
            <div className="ml-auto">
              <FileUploadModal />
            </div>
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <FileUploadModal />
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
      <FilePreviewModal
        open={rowAction?.variant === "preview"}
        onOpenChange={() => setRowAction(null)}
        fileId={rowAction?.row.original.id ?? ""}
      />
      <FileUpdateSheet
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        fileId={rowAction?.row.original.id ?? ""}
      />
      <FileDeleteModal
        fileIds={[rowAction?.row.original.id ?? ""]}
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}
