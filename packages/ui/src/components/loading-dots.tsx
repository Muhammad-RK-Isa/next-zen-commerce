import { cn } from "@nzc/ui/utils/cn";

const dots = "mx-[1px] inline-block size-1 animate-blink rounded-full";

export const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <span className="inline-flex items-center">
      <span className={cn(dots, className)} />
      <span className={cn(dots, "delay-150", className)} />
      <span className={cn(dots, "delay-300", className)} />
    </span>
  );
};
