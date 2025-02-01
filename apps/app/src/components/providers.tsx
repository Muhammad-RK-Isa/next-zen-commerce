"use client";

import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useMediaQuery } from "usehooks-ts";

import { Toaster } from "@nzc/ui/components/sonner";
import { ThemeProvider } from "@nzc/ui/components/theme-provider";
import { TooltipProvider } from "@nzc/ui/components/tooltip";

import { TRPCReactProvider } from "~/trpc/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1080px)");
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        enableColorScheme
        disableTransitionOnChange
        defaultTheme="dark"
      >
        <TooltipProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TooltipProvider>
        <Toaster
          richColors
          expand={isDesktop}
          position={isDesktop ? "bottom-right" : "top-center"}
        />
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
