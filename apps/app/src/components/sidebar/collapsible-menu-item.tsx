"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nzc/ui/components/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@nzc/ui/components/sidebar";

import type { NavItem } from ".";

interface CollapsibleMenuItemProps {
  item: NavItem;
}

export function CollapsibleMenuItem({ item }: CollapsibleMenuItemProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  if (!item.items?.length) return null;
  return (
    <Collapsible
      asChild
      defaultOpen={
        item.url === pathname || item.items.some((v) => v.url === pathname)
      }
      className="group/collapsible"
      open={open}
      onOpenChange={(v) => {
        if (pathname !== item.url) setOpen(true);
        else setOpen(v);
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <Link href={item.url} prefetch={true}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={item.url === pathname}
            >
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </Link>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={subItem.url === pathname}
                >
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
