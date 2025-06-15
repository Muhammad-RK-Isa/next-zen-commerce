import { cn } from "@nzc/ui/lib/utils"
import { motion } from "motion/react"
import type React from "react"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-secondary/20 relative overflow-hidden rounded-lg",
        className
      )}
      {...props}
    >
      <motion.div
        className="via-primary/5 dark:via-primary/10 absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    </div>
  )
}

export { Skeleton }
