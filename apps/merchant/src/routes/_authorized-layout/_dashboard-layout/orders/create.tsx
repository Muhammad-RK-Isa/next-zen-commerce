import { HeadContent, createFileRoute } from "@tanstack/react-router"
import { genPageTitle } from "~/lib/utils"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/orders/create"
)({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: genPageTitle("Create Order"),
      },
      {
        name: "description",
        content: "Create a new order",
      },
    ],
  }),
})

function RouteComponent() {
  return (
    <>
      <HeadContent />
      Create a new order
    </>
  )
}
