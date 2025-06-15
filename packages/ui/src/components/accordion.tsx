"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { HTMLMotionProps, Transition } from "motion/react"
import * as React from "react"

import { cn } from "@nzc/ui/lib/utils"

interface AccordionItemContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const AccordionItemContext = React.createContext<
  AccordionItemContextType | undefined
>(undefined)

const useAccordionItem = (): AccordionItemContextType => {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error("useAccordionItem must be used within an AccordionItem")
  }
  return context
}

type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
>

const Accordion = AccordionPrimitive.Root

interface AccordionItemProps
  extends React.ComponentProps<typeof AccordionPrimitive.Item> {
  children: React.ReactNode
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  className,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <AccordionItemContext.Provider value={{ isOpen, setIsOpen }}>
      <AccordionPrimitive.Item className={cn("border-b", className)} {...props}>
        {children}
      </AccordionPrimitive.Item>
    </AccordionItemContext.Provider>
  )
}
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  transition?: Transition
  chevron?: boolean
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className,
  children,
  transition = { type: "spring", stiffness: 150, damping: 22 },
  chevron = true,
  ref,
  ...props
}) => {
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)
  const { isOpen, setIsOpen } = useAccordionItem()

  React.useEffect(() => {
    const node = triggerRef.current
    if (!node) {
      return
    }

    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.attributeName === "data-state") {
          const currentState = node.getAttribute("data-state")
          setIsOpen(currentState === "open")
        }
      })
    })
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-state"],
    })
    const initialState = node.getAttribute("data-state")
    setIsOpen(initialState === "open")
    return () => {
      observer.disconnect()
    }
  }, [setIsOpen])

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={triggerRef}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-start font-medium hover:underline",
          className
        )}
        {...props}
      >
        {children}

        {chevron && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={transition}
          >
            <ChevronDown className="size-5 shrink-0" />
          </motion.div>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
AccordionTrigger.displayName = "AccordionTrigger"

type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
> &
  HTMLMotionProps<"div"> & {
    transition?: Transition
  }

const AccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  transition = { type: "spring", stiffness: 150, damping: 22 },
  ...props
}) => {
  const { isOpen } = useAccordionItem()

  return (
    <AnimatePresence>
      {isOpen && (
        <AccordionPrimitive.Content forceMount {...props}>
          <motion.div
            key="accordion-content"
            initial={{ height: 0, opacity: 0, "--mask-stop": "0%" }}
            animate={{ height: "auto", opacity: 1, "--mask-stop": "100%" }}
            exit={{ height: 0, opacity: 0, "--mask-stop": "0%" }}
            transition={transition}
            style={{
              maskImage:
                "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
              WebkitMaskImage:
                "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
            }}
            className="overflow-hidden"
            {...props}
          >
            <div className={cn("pb-4 pt-0 text-sm", className)}>{children}</div>
          </motion.div>
        </AccordionPrimitive.Content>
      )}
    </AnimatePresence>
  )
}
AccordionContent.displayName = "AccordionContent"

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordionItem,
  type AccordionItemContextType,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
}
