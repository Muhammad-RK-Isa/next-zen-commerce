import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@nzc/ui/utils/cn";

import { LoadingDots } from "./loading-dots";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loader?: "spinner" | "dots";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loader = "dots",
  icon,
  iconPosition = "left",
  ...props
}) => {
  const Comp = asChild ? Slot : "button";

  const LoadingIcon = () => {
    const colorClass =
      variant === "default" || variant === "destructive"
        ? "bg-background"
        : "bg-primary";
    return loader === "spinner" ? (
      <Spinner
        containerClassName={cn(size === "sm" ? "size-3.5" : "size-4")}
        barClassName={colorClass}
      />
    ) : (
      <LoadingDots className={colorClass} />
    );
  };

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <>
          {iconPosition !== "right" ? <LoadingIcon /> : null}
          {children}
          {iconPosition === "right" ? <LoadingIcon /> : null}
        </>
      ) : icon ? (
        <>
          {iconPosition !== "right" ? icon : null}
          {children}
          {iconPosition === "right" ? icon : null}
        </>
      ) : (
        children
      )}
    </Comp>
  );
};
Button.displayName = "Button";

export { Button, buttonVariants };
