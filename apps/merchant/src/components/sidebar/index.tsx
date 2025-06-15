"use client"

import {
  Box,
  ChartLine,
  ComponentIcon,
  GalleryVertical,
  LayersIcon,
  PlusIcon,
  Settings2,
  ShoppingCart,
  SlidersHorizontalIcon,
  TagIcon,
  UserRoundCogIcon,
  UsersRound,
} from "lucide-react"
import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@nzc/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@nzc/ui/components/tooltip"

import { CollapsibleMenuItem } from "./collapsible-menu-item"
import { CommandSearch } from "./command-search"
import { NavStoreSelect } from "./nav-store-select"
import { NavUser } from "./nav-user"

import { cn } from "@nzc/ui/lib/utils"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useMediaQuery } from "usehooks-ts"
import type { FileRoutesByTo } from "~/routeTree.gen"

export interface NavSubItem {
  title: string
  path: keyof FileRoutesByTo
  icon: React.ComponentType<React.ComponentProps<"svg">>
}

export type NavItem = {
  title: string
  icon: React.ComponentType<React.ComponentProps<"svg">>
  action?: () => void
  actionIcon?: React.ComponentType<React.ComponentProps<"svg">>
  actionTitle?: string
} & (
  | { path: keyof FileRoutesByTo; items?: NavSubItem[] }
  | { items: NavSubItem[]; path?: keyof FileRoutesByTo }
)

export function MerchantSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const isTouchDevice = useMediaQuery("(any-pointer: coarse)")

  const items: NavItem[] = [
    {
      title: "Overview",
      path: "/overview",
      icon: ChartLine,
    },
    {
      title: "Orders",
      path: "/orders",
      icon: ShoppingCart,
      action: () => navigate({ to: "/orders/create" }),
      actionIcon: PlusIcon,
      actionTitle: "Create Order",
    },
    {
      title: "Products",
      path: "/products",
      icon: Box,
      items: [
        {
          title: "Inventory",
          path: "/inventory",
          icon: LayersIcon,
        },
        {
          title: "Categories",
          path: "/categories",
          icon: TagIcon,
        },
        {
          title: "Collections",
          path: "/collections",
          icon: ComponentIcon,
        },
      ],
    },
    {
      title: "Customers",
      path: "/customers",
      icon: UsersRound,
    },
    {
      title: "Files",
      path: "/files",
      icon: GalleryVertical,
    },
    {
      title: "Settings",
      icon: Settings2,
      path: "/settings",
      items: [
        {
          title: "General",
          path: "/settings/general",
          icon: SlidersHorizontalIcon,
        },
        {
          title: "Account",
          path: "/account",
          icon: UserRoundCogIcon,
        },
      ],
    },
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <NavStoreSelect />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarMenu>
            <CommandSearch />
            {items.map((item, idx) => {
              if (item.items?.length) {
                return <CollapsibleMenuItem key={idx} item={item} />
              }
              return (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.path === location.pathname}
                    onMouseDown={() => {
                      item.path && navigate({ to: item.path })
                      setOpenMobile(false)
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.action ? (
                    <Tooltip delayDuration={700}>
                      <TooltipTrigger asChild>
                        <SidebarMenuAction
                          className={cn(
                            "transition-all",
                            isTouchDevice
                              ? "opacity-100"
                              : "opacity-0 hover:bg-primary/10 group-hover/menu-item:opacity-100"
                          )}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            item.action?.()
                            setOpenMobile(false)
                          }}
                        >
                          {item.actionIcon ? <item.actionIcon /> : null}
                        </SidebarMenuAction>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        sideOffset={10}
                      >
                        {item.actionTitle}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
