import * as React from "react";
import * as ProgressTabsPrimitives from "@radix-ui/react-tabs";
import { CheckCircle2, CircleDashed, CircleFadingArrowUp } from "lucide-react";

import { cn } from "@nzc/ui/utils/cn";

export type ProgressStatus = "not-started" | "in-progress" | "completed";

const ProgressTabsRoot = (props: ProgressTabsPrimitives.TabsProps) => {
  return <ProgressTabsPrimitives.Root {...props} />;
};
ProgressTabsRoot.displayName = "ProgressTabs";

interface IndicatorProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  status?: ProgressStatus;
}

const ProgressIndicator = ({ status, className, ...props }: IndicatorProps) => {
  const Icon = React.useMemo(() => {
    switch (status) {
      case "not-started":
        return CircleDashed;
      case "in-progress":
        return CircleFadingArrowUp;
      case "completed":
        return CheckCircle2;
      default:
        return CircleDashed;
    }
  }, [status]);

  return (
    <span
      className={cn(
        "text-muted-foreground group-data-[state=active]/trigger:text-primary",
        className,
      )}
      {...props}
    >
      <Icon className="size-4" />
    </span>
  );
};
ProgressIndicator.displayName = "ProgressTabs.ProgressIndicator";

interface ProgressTabsTriggerProps
  extends Omit<
    React.ComponentProps<typeof ProgressTabsPrimitives.Trigger>,
    "asChild"
  > {
  status?: ProgressStatus;
}

const ProgressTabsTrigger: React.FC<ProgressTabsTriggerProps> = ({
  className,
  children,
  status = "not-started",
  ...props
}: ProgressTabsTriggerProps) => (
  <ProgressTabsPrimitives.Trigger
    className={cn(
      "inline-flex h-[52px] w-full max-w-[200px] flex-1 items-center gap-x-2 border-r px-4 text-left text-sm text-muted-foreground opacity-50 outline-none transition-colors",
      "group/trigger overflow-hidden text-ellipsis whitespace-nowrap",
      "disabled:text-muted-foreground disabled:opacity-50",
      "hover:bg-accent/50",
      "focus:z-[1] focus-visible:bg-background",
      "data-[state=active]:text-primary data-[state=active]:opacity-100",
      className,
    )}
    {...props}
  >
    <ProgressIndicator status={status} />
    {children}
  </ProgressTabsPrimitives.Trigger>
);
ProgressTabsTrigger.displayName = "ProgressTabs.Trigger";

const ProgressTabsList: React.FC<
  React.ComponentProps<typeof ProgressTabsPrimitives.List>
> = ({ className, ...props }) => (
  <ProgressTabsPrimitives.List
    className={cn("flex items-center", className)}
    {...props}
  />
);
ProgressTabsList.displayName = "ProgressTabs.List";

const ProgressTabsContent: React.FC<
  React.ComponentProps<typeof ProgressTabsPrimitives.Content>
> = ({ className, ...props }) => {
  return (
    <ProgressTabsPrimitives.Content
      className={cn("outline-none", className)}
      {...props}
    />
  );
};
ProgressTabsContent.displayName = "ProgressTabs.Content";

const ProgressTabs = Object.assign(ProgressTabsRoot, {
  Trigger: ProgressTabsTrigger,
  List: ProgressTabsList,
  Content: ProgressTabsContent,
});

export { ProgressTabs };
