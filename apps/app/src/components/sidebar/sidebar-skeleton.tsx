import { Skeleton } from "@nzc/ui/components/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="hidden w-64 flex-col gap-2 border-r lg:flex">
      <div className="h-16 border-b px-2 py-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1 px-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-8 w-full" />
        ))}
      </div>
      <div className="mt-auto px-2">
        <Skeleton className="h-12 w-60 rounded-lg" />
      </div>
    </div>
  );
}
