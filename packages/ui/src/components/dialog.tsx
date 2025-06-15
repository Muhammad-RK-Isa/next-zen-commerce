"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import type React from "react"

import { cn } from "@nzc/ui/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay: React.FC<
  React.ComponentProps<typeof DialogPrimitive.Overlay>
> = ({ className, ...props }) => (
  <DialogPrimitive.Overlay
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
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean
}

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
  showCloseButton = false,
  ...props
}) => (
  <DialogPortal>
    <DialogOverlay>
      <DialogPrimitive.Content
        className={cn(
          "bg-background z-50 grid w-full max-w-lg gap-4 overflow-hidden rounded-xl border p-4 shadow-sm outline-none drop-shadow-sm sm:p-6",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-90 transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle: React.FC<
  React.ComponentProps<typeof DialogPrimitive.Title>
> = ({ className, ...props }) => (
  <DialogPrimitive.Title
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription: React.FC<
  React.ComponentProps<typeof DialogPrimitive.Description>
> = ({ className, ...props }) => (
  <DialogPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
