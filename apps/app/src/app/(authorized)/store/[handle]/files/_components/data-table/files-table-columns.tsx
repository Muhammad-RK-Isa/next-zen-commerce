import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatDate } from "date-fns";
import { FileAudio2Icon, FileTextIcon, FileVideoIcon } from "lucide-react";

import type { AppRouterOutputs } from "@nzc/api/app";
import { Checkbox } from "@nzc/ui/components/checkbox";
import { DataTableColumnHeader } from "@nzc/ui/components/data-table/data-table-column-header";

export function getColumns(): ColumnDef<
  AppRouterOutputs["file"]["list"]["data"][number]
>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="ml-1 grid">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="ml-1 grid">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 28,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex max-w-28 items-center gap-2 lg:max-w-lg">
            <div className="relative flex size-8 min-w-8 items-center justify-center rounded-md bg-muted">
              {file.type === "image" ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  sizes="(min-width: 48px) 48px, 10vw"
                  loading="lazy"
                  className="rounded-md object-cover"
                />
              ) : file.type === "video" ? (
                <FileVideoIcon className="size-4 text-muted-foreground" />
              ) : file.type === "audio" ? (
                <FileAudio2Icon className="size-4 text-muted-foreground" />
              ) : (
                <FileTextIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <span className="truncate">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date, "yyyy-mm-dd"),
    },
  ];
}
