"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import {
  CalendarIcon,
  EditIcon,
  Ellipsis,
  EyeIcon,
  ImageIcon,
  TagIcon,
  TextIcon,
  Trash2Icon,
  TrendingUpDownIcon,
} from "lucide-react"
import type React from "react"

import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { Badge } from "@nzc/ui/components/badge"
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
import { Image } from "~/components/image"

interface GetInventoryItemsTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<
      MerchantRouterOutputs["inventory"]["list"]["data"][number]
    > | null>
  >
  quantityRange: [number, number]
}

export function getInventoryItemsTableColumns({
  setRowAction,
  quantityRange,
}: GetInventoryItemsTableColumnsProps): ColumnDef<
  MerchantRouterOutputs["inventory"]["list"]["data"][number]
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
        const fileType = row.original.image?.type
        const fileUrl = row.original.image?.url

        return (
          <div className="flex items-center gap-2 max-w-28 sm:max-w-48 md:max-w-xs lg:max-w-lg">
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
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
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
      id: "sku",
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      cell: ({ row }) =>
        row.original.sku ? (
          <Badge variant="outline" canCopy copyContent={row.original.sku}>
            {row.original.sku}
          </Badge>
        ) : (
          "N/A"
        ),
      meta: {
        label: "SKU",
        placeholder: "Search SKUs...",
        variant: "text",
        icon: TagIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.quantity}</span>
      ),
      meta: {
        label: "Quantity range",
        icon: TrendingUpDownIcon,
        variant: "range",
        range: quantityRange,
      },
      enableColumnFilter: true,
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
              </DropdownMenuItem>{" "}
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
