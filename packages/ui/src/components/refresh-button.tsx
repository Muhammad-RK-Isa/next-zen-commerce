"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

import type { ButtonProps } from "./button";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface RefreshButtonProps extends ButtonProps {
  showTooltip?: boolean;
}

export function RefreshButton({
  showTooltip = true,
  ...props
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => {
            if (typeof window === "undefined") return;
            setIsRefreshing(true);
            void router.refresh();
            setIsRefreshing(false);
          }}
          {...props}
          className={cn("size-8", props.className)}
        >
          {isRefreshing ? (
            <Spinner />
          ) : (
            <RotateCw className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only">Refresh the page</span>
        </Button>
      </TooltipTrigger>
      {showTooltip ? (
        <TooltipContent>
          <p>Refresh the page</p>
        </TooltipContent>
      ) : null}
    </Tooltip>
  );
}
