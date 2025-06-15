"use client"

import { cn } from "@nzc/ui/lib/utils"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { type HTMLMotionProps, motion } from "motion/react"
import * as React from "react"

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> &
  HTMLMotionProps<"button">

const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => {
  const [isChecked, setIsChecked] = React.useState(
    props?.checked ?? props?.defaultChecked ?? false
  )

  React.useEffect(() => {
    if (props?.checked !== undefined) {
      setIsChecked(props.checked)
    }
  }, [props?.checked])

  return (
    <CheckboxPrimitive.Root
      {...props}
      onCheckedChange={(checked) => {
        setIsChecked(checked)
        props.onCheckedChange?.(checked)
      }}
      asChild
    >
      <motion.button
        className={cn(
          "bg-input focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="size-3.5"
            initial="unchecked"
            animate={isChecked ? "checked" : "unchecked"}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              variants={{
                checked: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.1,
                    delay: 0.1,
                  },
                },
                unchecked: {
                  pathLength: 0,
                  opacity: 0,
                  transition: {
                    duration: 0.1,
                  },
                },
              }}
            />
          </motion.svg>
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  )
}

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, type CheckboxProps }
