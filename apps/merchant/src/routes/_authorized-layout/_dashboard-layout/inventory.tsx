import { createFileRoute } from "@tanstack/react-router"
import { InventoryItemsTable } from "~/components/inventory/inventory-items-table/inventory-items-table"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/inventory"
)({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.orpc.inventory.getQuantityRange.queryOptions()
    )
    return
  },
  component: RouteComponent,
  wrapInSuspense: true,
  pendingComponent: () => <div>Loading...</div>,
})

function RouteComponent() {
  return <InventoryItemsTable />
}
