"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import type { ButtonProps } from "./button";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface CopyButtonProps extends ButtonProps {
  showTooltip?: boolean;
}

export function CopyButton({
  value,
  showTooltip = true,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => {
            if (typeof window === "undefined") return;
            setIsCopied(true);
            void window.navigator.clipboard.writeText(value?.toString() ?? "");
            setTimeout(() => setIsCopied(false), 2000);
          }}
          {...props}
        >
          {isCopied ? (
            <CheckIcon className="size-4" aria-hidden="true" />
          ) : (
            <CopyIcon className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {isCopied ? "Copied" : "Copy to clipboard"}
          </span>
        </Button>
      </TooltipTrigger>
      {showTooltip ? (
        <TooltipContent>
          <p>Copy to clipboard</p>
        </TooltipContent>
      ) : null}
    </Tooltip>
  );
}
