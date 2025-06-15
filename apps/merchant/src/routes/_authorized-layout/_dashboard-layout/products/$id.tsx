import { createFileRoute, useLocation } from "@tanstack/react-router"
import React from "react"
import { useBreadcrumbsStore } from "~/lib/hooks/use-breadcrumbs"
import type { FileRoutesByTo } from "~/routeTree.gen"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/products/$id"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const location = useLocation()
  const { setBreadcrumbs } = useBreadcrumbsStore()

  React.useEffect(() => {
    return () =>
      setBreadcrumbs([
        { label: "Products", path: "/products" },
        { label: id, path: location.pathname as keyof FileRoutesByTo },
      ])
  }, [id])

  return <div>Product ID: {id}</div>
}
