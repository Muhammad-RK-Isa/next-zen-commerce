import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import React from "react"
import type { orpc } from "~/router"

export interface RouterAppContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootRouteComponent,
})

function RootRouteComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.NODE_ENV !== "production" ? (
        <>
          <ReactQueryDevtools />
          <TanStackRouterDevtools />
        </>
      ) : null}
    </>
  )
}

const ReactQueryDevtools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
)

const TanStackRouterDevtools = React.lazy(() =>
  import("@tanstack/react-router-devtools").then((d) => ({
    default: d.TanStackRouterDevtools,
  }))
)
