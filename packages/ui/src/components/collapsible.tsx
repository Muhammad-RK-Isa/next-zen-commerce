import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@nzc/ui/utils/cn";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent: React.FC<
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>
> = ({ children, ...props }) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      {...props}
      className={cn(
        "overflow-hidden [--radix-collapsible-content-height:0px] data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        props.className,
      )}
    >
      {children}
    </CollapsiblePrimitive.CollapsibleContent>
  );
};

CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
