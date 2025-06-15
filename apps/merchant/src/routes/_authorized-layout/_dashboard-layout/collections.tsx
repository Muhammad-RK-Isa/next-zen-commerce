import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/collections"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authorized-layout/_dashboard-layout/collections"!</div>
}
