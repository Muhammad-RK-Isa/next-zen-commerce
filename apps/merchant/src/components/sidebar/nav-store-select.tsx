"use client"

import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import {
  CheckIcon,
  ChevronsUpDown,
  PlusCircleIcon,
  StoreIcon,
} from "lucide-react"
import React from "react"

import { Button } from "@nzc/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@nzc/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nzc/ui/components/popover"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@nzc/ui/components/sidebar"
import { cn } from "@nzc/ui/lib/utils"

import {
  useLocation,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router"
import { toast } from "sonner"
import { Image } from "~/components/image"
import { isValidUrl } from "~/lib/utils"

export function NavStoreSelect() {
  const navigate = useNavigate()
  const location = useLocation()

  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })

  const [open, setOpen] = React.useState(false)

  const { data: stores } = useSuspenseQuery(orpc.store.list.queryOptions())
  const { data: activeStore } = useSuspenseQuery(
    orpc.store.getActive.queryOptions()
  )

  const { mutateAsync: setActiveStoreSync } = useMutation(
    orpc.store.setActive.mutationOptions()
  )

  function handleStoreSelect(storeName: string) {
    const storeId = stores.find((store) => store.name === storeName)?.id
    if (!storeId) {
      return
    }
    setOpen(false)
    if (storeId === activeStore?.id) {
      return
    }
    if (storeId) {
      setActiveStoreSync(
        { id: storeId },
        {
          onSuccess: ({ store }) => {
            toast.success(`Switched to ${store.name}.`, {
              description: `Interacting as ${store.role}.`,
            })
            queryClient.invalidateQueries()
          },
        }
      )
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="items-center justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="inline-flex items-center space-x-1.5 sm:space-x-2">
                <div className="relative flex size-5 items-center justify-center overflow-hidden rounded-full border bg-accent/40 sm:size-7">
                  {activeStore?.logo && isValidUrl(activeStore.logo.url) ? (
                    <Image
                      src={activeStore.logo.url}
                      width={48}
                      height={48}
                      layout="fixed"
                      alt={activeStore.logo.alt ?? "Store logo"}
                      className="rounded-full"
                    />
                  ) : (
                    <StoreIcon className="size-4" />
                  )}
                </div>
                <h2 className="max-w-28 truncate font-semibold text-primary sm:max-w-36">
                  {activeStore?.name}
                </h2>
              </div>
              <ChevronsUpDown className="opacity-50" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="center">
            <Command>
              <CommandInput placeholder="Search stores..." className="h-9" />
              <CommandList>
                <CommandEmpty>No stores found.</CommandEmpty>
                <CommandGroup>
                  {stores.map((store) => (
                    <CommandItem
                      key={store.id}
                      value={store.name}
                      onSelect={handleStoreSelect}
                    >
                      {store.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          activeStore?.id === store.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="border-t p-1">
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start px-2 text-sm"
                onClick={() => {
                  navigate({
                    to: "/stores/create",
                    search: { redirectPath: location.pathname },
                  })
                  setOpen(false)
                }}
              >
                <PlusCircleIcon />
                Create new store
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
