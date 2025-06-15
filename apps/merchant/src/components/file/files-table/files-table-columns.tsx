"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import {
  AudioLinesIcon,
  CalendarIcon,
  DownloadIcon,
  EditIcon,
  Ellipsis,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  FileTypeIcon,
  ImageIcon,
  TextIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react"
import React from "react"

import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { Button } from "@nzc/ui/components/button"
import { Checkbox } from "@nzc/ui/components/checkbox"
import { DataTableColumnHeader } from "@nzc/ui/components/data-table/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nzc/ui/components/dropdown-menu"
import { cn } from "@nzc/ui/lib/utils"
import type { DataTableRowAction } from "@nzc/ui/types/data-table"
import { fileTypeSchema } from "@nzc/validators/common"
import { Image } from "~/components/image"
import { handleDownloadFile } from "~/lib/handle-download-file"

interface GetFilesTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<
      MerchantRouterOutputs["file"]["list"]["data"][number]
    > | null>
  >
}

export function getFilesTableColumns({
  setRowAction,
}: GetFilesTableColumnsProps): ColumnDef<
  MerchantRouterOutputs["file"]["list"]["data"][number]
>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-1"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="ml-1"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 32,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const fileType = row.original.type
        const fileUrl = row.original.url

        return (
          <div className="flex items-center gap-2 max-w-32 sm:max-w-48 md:max-w-60">
            <div
              className={cn(
                "flex size-8 min-w-8 items-center justify-center rounded-lg bg-muted",
                fileType !== "image" && "border border-accent-foreground/10"
              )}
            >
              {fileType === "image" && fileUrl ? (
                <Image
                  src={fileUrl}
                  alt={row.original.name}
                  width={48}
                  aspectRatio={1 / 1}
                  className="rounded-lg object-cover"
                />
              ) : fileType === "video" ? (
                <VideoIcon className="size-4 text-muted-foreground" />
              ) : fileType === "audio" ? (
                <AudioLinesIcon className="size-4 text-muted-foreground" />
              ) : fileType === "document" ? (
                <FileTextIcon className="size-4 text-muted-foreground" />
              ) : (
                <FileIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <span className="truncate">{row.original.name}</span>
          </div>
        )
      },
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: TextIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.type}</span>
      ),
      meta: {
        label: "Type",
        icon: FileTypeIcon,
        variant: "multiSelect",
        options: fileTypeSchema.options.map((type) => ({
          label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          value: type,
          icon: () => {
            switch (type) {
              case "image":
                return <ImageIcon className="size-4 text-muted-foreground" />
              case "video":
                return <VideoIcon className="size-4 text-muted-foreground" />
              case "audio":
                return (
                  <AudioLinesIcon className="size-4 text-muted-foreground" />
                )
              case "document":
              default:
                return <FileTextIcon className="size-4 text-muted-foreground" />
            }
          },
        })),
      },
      enableColumnFilter: true,
    },
    {
      id: "size",
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => {
        const size = row.original.size
        if (size === undefined || size === null) {
          return <span>-</span>
        }

        const units = ["B", "KB", "MB", "GB", "TB"]
        let formattedSize = size
        let unitIndex = 0

        while (formattedSize >= 1024 && unitIndex < units.length - 1) {
          formattedSize /= 1024
          unitIndex++
        }

        return (
          <span className="font-medium">
            {formattedSize.toFixed(2)}&nbsp;{units[unitIndex]}
          </span>
        )
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <span className="text-nowrap">
          {formatDate(row.original.createdAt, "MMM d, yyyy h:mm a")}
        </span>
      ),
      meta: {
        label: "Created At",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [progress, setProgress] = React.useState(0)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "preview" })}
                onClick={(e) => e.stopPropagation()}
              >
                <EyeIcon />
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
                onClick={(e) => e.stopPropagation()}
              >
                <EditIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation()
                  await handleDownloadFile({
                    ...row.original,
                    progress,
                    setProgress,
                  })
                }}
              >
                <DownloadIcon />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]
}
