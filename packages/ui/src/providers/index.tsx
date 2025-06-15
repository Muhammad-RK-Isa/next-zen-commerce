"use client"

import { Toaster } from "@nzc/ui/components/sonner"
import { TooltipProvider } from "@nzc/ui/components/tooltip"
import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider } from "next-themes"
import { useMediaQuery } from "usehooks-ts"

export const UIProvider = ({ children, ...properties }: ThemeProviderProps) => {
  const isDesktop = useMediaQuery("(min-width: 767px)")
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...properties}
    >
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster
        richColors
        expand={isDesktop}
        visibleToasts={12}
        position={isDesktop ? "bottom-right" : "top-center"}
      />
    </ThemeProvider>
  )
}
