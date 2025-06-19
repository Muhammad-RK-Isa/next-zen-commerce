import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { AuroraBackground } from "@nzc/ui/components/aurora-background"
import { Button } from "@nzc/ui/components/button"
import { Input } from "@nzc/ui/components/input"
import { LoadingDots } from "@nzc/ui/components/loading-dots"
import { Scroller } from "@nzc/ui/components/scroller"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@nzc/ui/components/tooltip"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import {
  HeadContent,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import Fuse from "fuse.js"
import { Loader2Icon, MoveRightIcon, PlusIcon, StoreIcon } from "lucide-react"
import React from "react"
import { Image } from "~/components/image"
import { genPageTitle } from "~/lib/utils"

export const Route = createFileRoute("/_authorized-layout/stores/")({
  component: RouteComponent,
  preload: true,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.orpc.store.list.queryOptions()
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
        content: "Select a store to manage.",
      },
      {
        title: genPageTitle("Stores"),
      },
    ],
  }),
})

function RouteComponent() {
  const { orpc, queryClient } = Route.useRouteContext()
  const navigate = useNavigate()

  const { data: stores } = useSuspenseQuery(orpc.store.list.queryOptions())

  const {
    mutateAsync: setActiveStoreSync,
    isPending: isStoreSelecting,
    variables,
  } = useMutation(orpc.store.setActive.mutationOptions())

  const [search, setSearch] = React.useState("")

  const fuse = new Fuse(stores, {
    keys: ["name"],
    threshold: 0.3,
    distance: 100,
  })

  const filteredStores = search
    ? fuse.search(search).map((result) => result.item)
    : stores

  async function handleStoreSelect(
    store: MerchantRouterOutputs["store"]["list"][number]
  ) {
    await setActiveStoreSync(
      { id: store.id },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries()
          await navigate({ to: "/overview" })
        },
      }
    )
  }

  return (
    <>
      <HeadContent />
      <AuroraBackground className="flex items-center justify-center flex-col">
        <div className="max-w-2xl w-full">
          <div className="mb-4 flex items-center gap-2.5 relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores..."
              className="h-12 w-full min-w-0 rounded-lg sm:text-lg border-primary/10 text-primary"
            />
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="aspect-square absolute right-2"
                  onClick={() => navigate({ to: "/stores/create" })}
                >
                  <PlusIcon className="sm:!size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                align="center"
                side="right"
                sideOffset={5}
                showArrow
              >
                Create a new store
              </TooltipContent>
            </Tooltip>
          </div>
          <Scroller className="flex h-80 w-full flex-col gap-2" hideScrollbar>
            {filteredStores.map((store) => (
              <button
                disabled={isStoreSelecting}
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                className="w-full h-max pr-4 flex items-center space-x-2.5 border border-foreground/5 rounded-lg bg-accent/60 md:min-w-sm lg:min-w-md p-2 hover:border-primary/20 transition-all hover:transition-none group disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <div className="rounded-lg grid place-content-center">
                  {store.logo ? (
                    <Image
                      src={store.logo?.url}
                      alt={store.logo?.alt ?? `${store.name} - logo`}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="border bg-muted border-foreground/10 rounded-lg p-2">
                      <StoreIcon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="font-bold text-base text-primary/60">
                  {store.name}
                </span>
                <div className="ml-auto">
                  {isStoreSelecting && variables.id === store.id ? (
                    <LoadingDots className="bg-primary" />
                  ) : (
                    <MoveRightIcon className="group-hover:visible invisible text-primary/40 group-hover:translate-x-0 -translate-x-2 transition-all size-4" />
                  )}
                </div>
              </button>
            ))}
          </Scroller>
        </div>
      </AuroraBackground>
    </>
  )
}
