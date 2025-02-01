import { DataTableSkeleton } from "@nzc/ui/components/data-table/data-table-skeleton";
import { Skeleton } from "@nzc/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border bg-background px-4 py-2 lg:hidden">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex flex-col gap-4 lg:rounded-md lg:border lg:bg-card lg:p-4">
        <Skeleton className="hidden h-6 w-32 lg:block" />
        <DataTableSkeleton
          columnCount={1}
          rowCount={10}
          searchableColumnCount={1}
          shrinkZero
        />
      </div>
    </div>
  );
}
