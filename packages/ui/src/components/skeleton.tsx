import { cn } from "@nzc/ui/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-secondary/20",
        "before:absolute before:inset-0",
        "before:-translate-y-1/2 before:translate-x-[-100%]",
        "before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent before:dark:via-primary/10",
        "before:h-[200%] before:w-full",
        "before:animate-[shimmer_1.5s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
