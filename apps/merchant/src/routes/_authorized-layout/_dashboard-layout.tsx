import { SidebarInset, SidebarProvider } from "@nzc/ui/components/sidebar"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { MerchantSidebar } from "~/components/sidebar"

import { TopNav } from "~/components/top-nav"

export const Route = createFileRoute("/_authorized-layout/_dashboard-layout")({
  beforeLoad: async ({ context }) => {
    const hasActiveStoreId = await context.queryClient
      .ensureQueryData(context.orpc.auth.session.queryOptions())
      .then(({ session }) => !!session?.activeStoreId)
    if (!hasActiveStoreId) {
      throw redirect({ to: "/stores" })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <MerchantSidebar />
      <SidebarInset>
        <TopNav />
        <div className="p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
