"use client";

import type { Params } from "next/dist/server/request/params";
import React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CheckIcon, ChevronsUpDown, PlusCircleIcon } from "lucide-react";

import { Badge } from "@nzc/ui/components/badge";
import { Button } from "@nzc/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@nzc/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nzc/ui/components/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@nzc/ui/components/sidebar";
import { Skeleton } from "@nzc/ui/components/skeleton";
import { cn } from "@nzc/ui/utils/cn";

import { api } from "~/trpc/react";

interface StoreHandleParam extends Params {
  handle: string;
}

export function NavStoreSelect() {
  const router = useRouter();
  const pathname = usePathname();

  const { handle } = useParams<StoreHandleParam>();

  const [open, setOpen] = React.useState(false);

  const { data: stores, isPending } = api.store.listStores.useQuery();

  if (!handle || isPending || !stores)
    return <Skeleton className="h-9 w-full" />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="items-center justify-between px-4 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="inline-flex items-center space-x-1.5">
                <h2 className="max-w-28 truncate font-semibold text-primary">
                  {stores.find((store) => store.handle === handle)?.name}
                </h2>
                <Badge variant="outline" className="capitalize">
                  {stores.find((store) => store.handle === handle)?.role}
                </Badge>
              </div>
              <ChevronsUpDown className="opacity-50" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-60 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search stores..." className="h-9" />
              <CommandList>
                <CommandEmpty>No stores found.</CommandEmpty>
                <CommandGroup>
                  {stores.map((store) => (
                    <CommandItem
                      key={store.id}
                      value={store.handle}
                      onSelect={(value) => {
                        router.push(
                          `/store/${value}/${pathname.split("/").splice(3).join("/")}`,
                        );
                        setOpen(false);
                      }}
                    >
                      {store.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          handle === store.handle ? "opacity-100" : "opacity-0",
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
                  router.push("/store/create");
                  setOpen(false);
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
  );
}
