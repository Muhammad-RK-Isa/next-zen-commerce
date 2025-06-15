import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authorized-layout")({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const { session } = await context.queryClient.ensureQueryData(
      context.orpc.auth.session.queryOptions()
    )
    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirectPath: location.pathname },
      })
    }

    const hasStore = await context.queryClient.ensureQueryData(
      context.orpc.store.hasStore.queryOptions()
    )

    if (!hasStore && location.pathname !== "/stores/create") {
      throw redirect({
        to: "/stores/create",
        search: { redirectPath: location.pathname },
      })
    }

    return
  },
})

function RouteComponent() {
  return <Outlet />
}
