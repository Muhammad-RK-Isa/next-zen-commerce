import React from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HydrationBoundary } from "@tanstack/react-query";

import { SidebarProvider } from "@nzc/ui/components/sidebar";

import { AppSidebar } from "~/components/sidebar";
import { trpcServerUtils } from "~/trpc/server";

interface StoreHandleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    handle: string;
  }>;
}

export default async function StoreLayout({
  children,
  params,
}: StoreHandleLayoutProps) {
  const { handle } = await params;
  const pathname = (await headers()).get("x-path") ?? "/";

  if (handle !== "create") {
    const store = await trpcServerUtils.store.getByHandle.fetch(handle);

    if (!store) {
      return notFound();
    }
  }

  if (pathname === "/store") {
    return redirect(`/store/${handle}/dashboard`);
  }

  return (
    <SidebarProvider>
      <HydrationBoundary state={trpcServerUtils.dehydrate()}>
        <React.Suspense>
          <AppSidebar />
        </React.Suspense>
      </HydrationBoundary>
      {children}
    </SidebarProvider>
  );
}
