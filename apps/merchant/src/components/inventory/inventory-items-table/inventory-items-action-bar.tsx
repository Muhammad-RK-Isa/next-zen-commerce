import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@nzc/ui/components/data-table/data-table-action-bar"
import { Separator } from "@nzc/ui/components/separator"
import type { Table } from "@nzc/ui/types/data-table"
import { Trash2Icon } from "lucide-react"
import React from "react"
import { InventoryItemsDeleteModal } from "./inventory-items-delete-modal"

interface InventoryItemsTableActionBarProps {
  table: Table<MerchantRouterOutputs["inventory"]["list"]["data"][number]>
}

export function InventoryItemsTableActionBar({
  table,
}: InventoryItemsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <DataTableActionBarAction
        size="icon"
        tooltip="Delete items"
        onClick={() => setDeleteAlertOpen(true)}
      >
        <Trash2Icon />
      </DataTableActionBarAction>
      <InventoryItemsDeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onSuccess={() => table.toggleAllRowsSelected(false)}
        itemIds={rows.map((row) => row.original.id)}
      />
    </DataTableActionBar>
  )
}
