import { Skeleton } from "@nzc/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nzc/ui/components/table";
import { cn } from "@nzc/ui/utils/cn";

interface DataTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns in the table.
   * @type number
   */
  columnCount: number;

  /**
   * The number of rows in the table.
   * @default 10
   * @type number | undefined
   */
  rowCount?: number;

  /**
   * The number of searchable columns in the table.
   * @default 0
   * @type number | undefined
   */
  searchableColumnCount?: number;

  /**
   * The number of filterable columns in the table.
   * @default 0
   * @type number | undefined
   */
  filterableColumnCount?: number;

  /**
   * Flag to show the table view options.
   * @default undefined
   * @type boolean | undefined
   */
  showViewOptions?: boolean;

  /**
   * The width of each cell in the table.
   * The length of the array should be equal to the columnCount.
   * Any valid CSS width value is accepted.
   * @default ["auto"]
   * @type string[] | undefined
   */
  cellWidths?: string[];

  /**
   * Flag to show the pagination bar.
   * @default true
   * @type boolean | undefined
   */
  withPagination?: boolean;

  /**
   * Flag to prevent the table cells from shrinking.
   * @default false
   * @type boolean | undefined
   */
  shrinkZero?: boolean;
}

export function DataTableSkeleton(props: DataTableSkeletonProps) {
  const {
    columnCount,
    rowCount = 10,
    searchableColumnCount = 0,
    filterableColumnCount = 0,
    showViewOptions = true,
    cellWidths = ["auto"],
    withPagination = true,
    shrinkZero = false,
    className,
    ...skeletonProps
  } = props;

  return (
    <div
      className={cn(
        "w-full max-w-[calc(100vw-1.0625rem)] space-y-3.5 overflow-auto",
        className,
      )}
      {...skeletonProps}
    >
      <div className="flex w-full items-center justify-between space-x-2 overflow-auto py-1">
        <div className="flex flex-1 items-center space-x-2">
          {searchableColumnCount > 0
            ? Array.from({ length: searchableColumnCount }).map((_, i) => (
                <SlowSKeleton key={i} className="h-8 w-40 lg:w-64" />
              ))
            : null}
          {filterableColumnCount > 0
            ? Array.from({ length: filterableColumnCount }).map((_, i) => (
                <SlowSKeleton key={i} className="h-8 w-20 border-dashed" />
              ))
            : null}
        </div>
        {showViewOptions ? <SlowSKeleton className="ml-auto h-7 w-24" /> : null}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                    className="p-1"
                  >
                    <SlowSKeleton className="h-7 w-full" />
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
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                    className="p-1"
                  >
                    <SlowSKeleton className="h-[calc(2.5rem-0.5px)] w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination ? (
        <div className="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
          <SlowSKeleton className="h-7 w-40 shrink-0" />
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <SlowSKeleton className="h-7 w-24" />
              <SlowSKeleton className="h-7 w-[4.5rem]" />
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              <SlowSKeleton className="h-7 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <SlowSKeleton className="hidden size-7 lg:block" />
              <SlowSKeleton className="size-7" />
              <SlowSKeleton className="size-7" />
              <SlowSKeleton className="hidden size-7 lg:block" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SlowSKeleton({ className }: { className: string }) {
  return (
    <Skeleton
      className={cn("before:animate-[shimmer_2.5s_infinite]", className)}
    />
  );
}
