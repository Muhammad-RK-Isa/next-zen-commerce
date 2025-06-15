import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/categories"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authorized-layout/_dashboard-layout/categories"!</div>
}
