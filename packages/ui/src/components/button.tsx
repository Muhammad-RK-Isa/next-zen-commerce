import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@nzc/ui/lib/utils"
import { LoadingDots } from "./loading-dots"
import { Spinner } from "./spinner"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white",
        outline:
          "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loader?: "spinner" | "dots"
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
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
  const Comp = asChild ? Slot : "button"

  const LoadingIcon = () => {
    const colorClass =
      variant === "default" || variant === "destructive"
        ? "bg-background"
        : "bg-primary"
    return loader === "spinner" ? (
      <Spinner
        containerClassName={cn(size === "sm" ? "size-3.5" : "size-4")}
        barClassName={colorClass}
      />
    ) : (
      <LoadingDots className={colorClass} />
    )
  }

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
  )
}

export { Button, buttonVariants }
