import { useSuspenseQuery } from "@tanstack/react-query"
import { HeadContent, createFileRoute } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { genPageTitle } from "~/lib/utils"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/overview"
)({
  component: RouteComponent,
  preload: true,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.orpc.store.getActive.queryOptions()
    )
    return
  },
  pendingComponent: () => (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <Loader2Icon className="animate-spin" />
    </div>
  ),
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Overview of your store.",
      },
      {
        title: genPageTitle("Overview"),
      },
    ],
  }),
})

function RouteComponent() {
  const { orpc } = Route.useRouteContext()

  const { data: store } = useSuspenseQuery(orpc.store.getActive.queryOptions())

  return (
    <>
      <HeadContent />
      <pre className="bg-accent border p-4 rounded-lg text-muted-foreground break-words text-wrap">
        {JSON.stringify(store, null, 2)}
      </pre>
    </>
  )
}
