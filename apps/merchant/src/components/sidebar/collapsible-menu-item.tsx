"use client"

import { ChevronRight } from "lucide-react"
import React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nzc/ui/components/collapsible"
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@nzc/ui/components/sidebar"

import { useLocation, useNavigate } from "@tanstack/react-router"
import type { NavItem } from "."

interface CollapsibleMenuItemProps {
  item: NavItem
}

export function CollapsibleMenuItem({ item }: CollapsibleMenuItemProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()

  const [open, setOpen] = React.useState(false)
  if (!item.items?.length) {
    return null
  }
  return (
    <Collapsible
      asChild
      defaultOpen={
        item.path === location.pathname ||
        item.items.some((v) => v.path === location.pathname)
      }
      className="group/collapsible"
      open={open}
      onOpenChange={setOpen}
    >
      <SidebarMenuItem>
        {item.path ? (
          <>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={item.path === location.pathname}
              onMouseDown={() => {
                // biome-ignore  lint/style/noNonNullAssertion: item.path is always available here.
                navigate({ to: item.path! })
                setOpen(true)
                setOpenMobile(false)
              }}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(!open)
                }}
              >
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </>
        ) : (
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="active:bg-sidebar-accent/60 active:text-sidebar-accent-foreground/70 data-[state=open]:hover:bg-sidebar-accent/60 data-[state=open]:hover:text-sidebar-accent-foreground/70">
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  isActive={subItem.path === location.pathname}
                  onMouseDown={() => {
                    navigate({ to: subItem.path })
                    setOpenMobile(false)
                  }}
                >
                  <subItem.icon />
                  {subItem.title}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
