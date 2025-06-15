import { type Table as TanstackTable, flexRender } from "@tanstack/react-table"
import React from "react"

import { DataTablePagination } from "@nzc/ui/components/data-table/data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nzc/ui/components/table"
import { getCommonPinningStyles } from "@nzc/ui/lib/data-table"
import { cn } from "@nzc/ui/lib/utils"
import { parseAsInteger, useQueryState } from "nuqs"
import { DataTableSkeleton } from "./data-table-skeleton"

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>
  actionBar?: React.ReactNode
  isLoading?: boolean
  tableClassName?: string
}

export function DataTable<TData>({
  table,
  actionBar,
  isLoading = false,
  children,
  className,
  tableClassName,
  ...props
}: DataTableProps<TData>) {
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10))
  const [scrollState, setScrollState] = React.useState({
    scrollLeft: 0,
    scrollRight: 0,
  })
  const scrollContainerRef = React.useRef<HTMLTableElement>(null)

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLTableElement>) => {
      const target = e.currentTarget
      const scrollLeft = target.scrollLeft
      const scrollRight = target.scrollWidth - target.clientWidth - scrollLeft

      setScrollState({ scrollLeft, scrollRight })
    },
    []
  )
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="overflow-hidden rounded-md border">
        {isLoading ? (
          <div
            className={cn(
              "max-h-[calc(100vh-12.5rem)] overflow-auto",
              tableClassName
            )}
          >
            <DataTableSkeleton columnCount={1} rowCount={perPage} shrinkZero />
          </div>
        ) : (
          <Table
            className={cn(tableClassName)}
            containerClassName="max-h-[calc(100vh-12.5rem)] overflow-y-auto"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <TableHeader className="bg-background sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({
                          column: header.column,
                          table,
                          scrollLeft: scrollState.scrollLeft,
                          scrollRight: scrollState.scrollRight,
                        }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({
                            column: cell.column,
                            table,
                            scrollLeft: scrollState.scrollLeft,
                            scrollRight: scrollState.scrollRight,
                          }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  )
}
