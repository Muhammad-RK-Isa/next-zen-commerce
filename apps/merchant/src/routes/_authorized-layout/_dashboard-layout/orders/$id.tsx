import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/orders/$id"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Order ID: {id}</div>
}
