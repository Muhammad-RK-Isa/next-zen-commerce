import { UIProvider } from "@nzc/ui/provider"
import { createORPCReactQueryUtils } from "@orpc/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { NuqsAdapter } from "nuqs/adapters/react"
import { orpcClient } from "./orpc"
import { routeTree } from "./routeTree.gen"

export const queryClient = new QueryClient()

export const orpc = createORPCReactQueryUtils(orpcClient)

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    orpc,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <UIProvider>{children}</UIProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  ),
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
