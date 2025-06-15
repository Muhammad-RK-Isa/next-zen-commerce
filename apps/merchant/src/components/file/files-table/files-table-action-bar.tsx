import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@nzc/ui/components/data-table/data-table-action-bar"
import { Separator } from "@nzc/ui/components/separator"
import type { Table } from "@nzc/ui/types/data-table"
import { DownloadIcon, Trash2Icon } from "lucide-react"
import React from "react"
import { handleDownloadFile } from "~/lib/handle-download-file"
import { FileDeleteModal } from "./file-delete-modal"

interface FilesTableActionBarProps {
  table: Table<MerchantRouterOutputs["file"]["list"]["data"][number]>
}

export function FilesTableActionBar({ table }: FilesTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows

  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
  const [progresses, setProgresses] = React.useState<Record<string, number>>({})

  async function handleDownloadMultiple() {
    await Promise.all(
      rows.map(
        async (row) =>
          await handleDownloadFile({
            ...row.original,
            // biome-ignore  lint/style/noNonNullAssertion: progress is guranteed not not-null
            progress: progresses[row.original.id]!,
            setProgress: (progress) =>
              setProgresses((prev) => ({
                ...prev,
                [row.original.id]: progress,
              })),
          })
      )
    )
  }

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <DataTableActionBarAction
        size="icon"
        tooltip="Download files"
        onClick={handleDownloadMultiple}
      >
        <DownloadIcon />
      </DataTableActionBarAction>
      <DataTableActionBarAction
        size="icon"
        tooltip="Delete files"
        onClick={() => setDeleteAlertOpen(true)}
      >
        <Trash2Icon />
      </DataTableActionBarAction>
      <FileDeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onSuccess={() => table.toggleAllRowsSelected(false)}
        fileIds={rows.map((row) => row.original.id)}
      />
    </DataTableActionBar>
  )
}
