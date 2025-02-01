"use client";

import type { Params } from "next/dist/server/request/params";
import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Box,
  ChartLine,
  GalleryVertical,
  Settings2,
  ShoppingCart,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@nzc/ui/components/sidebar";

import { CollapsibleMenuItem } from "./collapsible-menu-item";
import { NavStoreSelect } from "./nav-store-select";
import { NavUser } from "./nav-user";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  items?: NavSubItem[];
}

interface StoreHandleParam extends Params {
  handle: string;
}

export function AppSidebar() {
  const { handle } = useParams<StoreHandleParam>();

  const items: NavItem[] = [
    {
      title: "Dashboard",
      url: `/store/${handle}/dashboard`,
      icon: ChartLine,
    },
    {
      title: "Orders",
      url: `/store/${handle}/orders`,
      icon: ShoppingCart,
    },
    {
      title: "Products",
      url: `/store/${handle}/products`,
      icon: Box,
      items: [
        {
          title: "Inventory",
          url: `/store/${handle}/inventory`,
        },
        {
          title: "Categories",
          url: `/store/${handle}/categories`,
        },
        {
          title: "Collections",
          url: `/store/${handle}/collections`,
        },
      ],
    },
    {
      title: "Users",
      url: `/store/${handle}/users`,
      icon: UsersRound,
    },
    {
      title: "Files",
      url: `/store/${handle}/files`,
      icon: GalleryVertical,
    },
    {
      title: "Settings",
      url: `/store/${handle}/settings`,
      icon: Settings2,
      items: [
        {
          title: "General",
          url: `/store/${handle}/settings/general`,
        },
        {
          title: "Account",
          url: "/settings/account",
        },
      ],
    },
  ];
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <NavStoreSelect />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              if (item.items?.length)
                return <CollapsibleMenuItem key={item.url} item={item} />;
              return (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} prefetch={true}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.url === pathname}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
