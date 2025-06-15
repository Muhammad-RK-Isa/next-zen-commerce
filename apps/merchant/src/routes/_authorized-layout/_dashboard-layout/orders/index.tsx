import { HeadContent, createFileRoute } from "@tanstack/react-router"
import { genPageTitle } from "~/lib/utils"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/orders/"
)({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: genPageTitle("Orders"),
      },
      {
        name: "description",
        content: "Manage orders",
      },
    ],
  }),
})

function RouteComponent() {
  return (
    <>
      <HeadContent />
      <p>Manage orders</p>
    </>
  )
}
