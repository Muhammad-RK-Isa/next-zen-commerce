"use client";

import * as React from "react";
import { Check } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@nzc/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nzc/ui/components/popover";
import { cn } from "@nzc/ui/utils/cn";

const FacetedFilter = Popover;

const FacetedFilterTrigger: React.FC<
  React.ComponentProps<typeof PopoverTrigger>
> = ({ className, children, ...props }) => (
  <PopoverTrigger className={cn(className)} {...props}>
    {children}
  </PopoverTrigger>
);
FacetedFilterTrigger.displayName = "FacetedFilterTrigger";

const FacetedFilterContent: React.FC<
  React.ComponentProps<typeof PopoverContent>
> = ({ className, children, ...props }) => (
  <PopoverContent
    className={cn("w-[12.5rem] p-0", className)}
    align="start"
    {...props}
  >
    <Command>{children}</Command>
  </PopoverContent>
);
FacetedFilterContent.displayName = "FacetedFilterContent";

const FacetedFilterInput = CommandInput;

const FacetedFilterList = CommandList;

const FacetedFilterEmpty = CommandEmpty;

const FacetedFilterGroup = CommandGroup;

interface FacetedFilterItemProps
  extends React.ComponentProps<typeof CommandItem> {
  selected: boolean;
}

const FacetedFilterItem: React.FC<FacetedFilterItemProps> = ({
  className,
  children,
  selected,
  ...props
}) => {
  return (
    <CommandItem
      aria-selected={selected}
      data-selected={selected}
      className={cn(className)}
      {...props}
    >
      <span
        className={cn(
          "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
          selected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible",
        )}
      >
        <Check className="size-4" />
      </span>
      {children}
    </CommandItem>
  );
};
FacetedFilterItem.displayName = "FacetedFilterItem";

const FacetedFilterSeparator = CommandSeparator;

const FacetedFilterShortcut = CommandShortcut;

export {
  FacetedFilter,
  FacetedFilterTrigger,
  FacetedFilterContent,
  FacetedFilterInput,
  FacetedFilterList,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterItem,
  FacetedFilterSeparator,
  FacetedFilterShortcut,
};
