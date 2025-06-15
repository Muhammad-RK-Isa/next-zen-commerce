"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type React from "react"

import { buttonVariants } from "@nzc/ui/components/button"
import { cn } from "@nzc/ui/lib/utils"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Overlay>
> = ({ className, ...props }) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 grid place-content-center overflow-auto duration-500",
      "bg-black/40 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
)
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Content>
> = ({ className, ...props }) => (
  <AlertDialogPortal>
    <AlertDialogOverlay>
      <AlertDialogPrimitive.Content
        className={cn(
          "bg-background z-50 grid w-full max-w-lg gap-4 overflow-hidden rounded-xl border p-4 shadow-sm outline-none drop-shadow-sm sm:p-6",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-90 transition-all !duration-300",
          className
        )}
        {...props}
      />
    </AlertDialogOverlay>
  </AlertDialogPortal>
)
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Title>
> = ({ className, ...props }) => (
  <AlertDialogPrimitive.Title
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
)
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Description>
> = ({ className, ...props }) => (
  <AlertDialogPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
)
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Action>
> = ({ className, ...props }) => (
  <AlertDialogPrimitive.Action
    className={cn(buttonVariants({ size: "sm" }), className)}
    {...props}
  />
)
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel: React.FC<
  React.ComponentProps<typeof AlertDialogPrimitive.Cancel>
> = ({ className, ...props }) => (
  <AlertDialogPrimitive.Cancel
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
)
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
