import { Skeleton } from "@nzc/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nzc/ui/components/table"
import { cn } from "@nzc/ui/lib/utils"
import type React from "react"

interface DataTableSkeletonProps extends React.ComponentProps<"div"> {
  columnCount: number
  rowCount?: number
  cellWidths?: string[]
  shrinkZero?: boolean
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  cellWidths = ["auto"],
  shrinkZero = false,
  className,
  ...props
}: DataTableSkeletonProps) {
  const cozyCellWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? "auto"
  )

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      <Table>
        <TableHeader>
          {Array.from({ length: 1 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableHead
                  key={j}
                  style={{
                    width: cozyCellWidths[j],
                    minWidth: shrinkZero ? cozyCellWidths[j] : "auto",
                  }}
                >
                  <Skeleton className="h-7 w-full" />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, j) => (
                <TableCell
                  key={j}
                  style={{
                    width: cozyCellWidths[j],
                    minWidth: shrinkZero ? cozyCellWidths[j] : "auto",
                  }}
                >
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
