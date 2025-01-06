import * as React from "react";

import { cn } from "@nzc/ui";

const Input: React.FC<React.ComponentProps<"input">> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-primary/20 hover:focus-within:border-input focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
};
Input.displayName = "Input";

export { Input };
