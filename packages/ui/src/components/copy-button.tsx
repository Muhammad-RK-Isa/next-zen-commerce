"use client"

import { type VariantProps, cva } from "class-variance-authority"
import { CheckIcon, CopyIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import * as React from "react"

import { cn } from "@nzc/ui/lib/utils"
import { toast } from "sonner"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        muted: "bg-muted text-muted-foreground",
        destructive:
          "bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white",
        outline:
          "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      },
      size: {
        default: "size-8 rounded-lg [&_svg]:size-4",
        sm: "size-6 [&_svg]:size-3",
        md: "size-10 rounded-lg [&_svg]:size-5",
        lg: "size-12 rounded-xl [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface CopyButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onCopy">,
    VariantProps<typeof buttonVariants> {
  content?: string
  delay?: number
  onCopy?: (content: string) => void
  isCopied?: boolean
  onCopyChange?: (isCopied: boolean) => void
}

const CopyButton: React.FC<CopyButtonProps> = ({
  content,
  className,
  size,
  variant,
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  ...props
}) => {
  const [localIsCopied, setLocalIsCopied] = React.useState(isCopied ?? false)
  const Icon = localIsCopied ? CheckIcon : CopyIcon

  React.useEffect(() => {
    setLocalIsCopied(isCopied ?? false)
  }, [isCopied])

  const handleIsCopied = React.useCallback(
    (isCopied: boolean) => {
      setLocalIsCopied(isCopied)
      onCopyChange?.(isCopied)
    },
    [onCopyChange]
  )

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isCopied) {
        return
      }
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            handleIsCopied(true)
            setTimeout(() => handleIsCopied(false), delay)
            onCopy?.(content)
          })
          .catch(() => {
            toast.error("Error copying command")
          })
      }
      onClick?.(e)
    },
    [isCopied, content, delay, onClick, onCopy, handleIsCopied]
  )

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={localIsCopied ? "check" : "copy"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

CopyButton.displayName = "CopyButton"

export { CopyButton, buttonVariants, type CopyButtonProps }
