"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import { type Transition, motion } from "motion/react"
import type * as React from "react"

import { cn } from "@nzc/ui/lib/utils"

const MotionProgressIndicator = motion.create(ProgressPrimitive.Indicator)

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  transition?: Transition
}

const Progress: React.FC<ProgressProps> = ({
  className,
  value,
  transition = { type: "spring", stiffness: 100, damping: 30 },
  ...props
}) => (
  <ProgressPrimitive.Root
    className={cn(
      "bg-secondary relative h-2 w-full overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    <MotionProgressIndicator
      className="bg-primary h-full w-full flex-1"
      animate={{
        translateX: `-${100 - (value || 0)}%`,
      }}
      transition={transition}
    />
  </ProgressPrimitive.Root>
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, type ProgressProps }
