import { BellIcon } from "lucide-react"
import React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nzc/ui/components/breadcrumb"
import { Button } from "@nzc/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nzc/ui/components/popover"
import { Separator } from "@nzc/ui/components/separator"
import { SidebarTrigger } from "@nzc/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@nzc/ui/components/tooltip"
import { Link, useLocation } from "@tanstack/react-router"
import { useBreadcrumbsStore } from "~/lib/hooks/use-breadcrumbs"
import type { FileRoutesByTo } from "~/routeTree.gen"

export function TopNav() {
  const notifications = [
    {
      id: 1,
      title: "New Order",
      description: "You have a new order from John Doe",
      date: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      title: "New Review",
      description: "You have a new review from Jane Smith",
      date: new Date().toLocaleDateString(),
    },
    {
      id: 3,
      title: "New Message",
      description: "You have a new message from Bob Johnson",
      date: new Date().toLocaleDateString(),
    },
  ]

  const location = useLocation()

  const { breadcrumbs, setBreadcrumbsFromPath } = useBreadcrumbsStore()

  React.useEffect(() => {
    setBreadcrumbsFromPath(location.pathname as keyof FileRoutesByTo)
  }, [location.pathname])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 border-b sticky top-0 bg-background z-50">
      <div className="flex items-center gap-2 pr-4">
        <Tooltip delayDuration={700}>
          <TooltipTrigger asChild>
            <SidebarTrigger className="-ml-1" />
          </TooltipTrigger>
          <TooltipContent align="center" side="right" showArrow>
            Toggle Sidebar
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map(({ label, path }, idx) => (
              <React.Fragment key={`${path}-${idx}`}>
                <BreadcrumbItem>
                  {location.pathname === path ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={path}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx !== breadcrumbs.length - 1 ? (
                  <BreadcrumbSeparator />
                ) : null}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Tooltip delayDuration={700}>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-7 rounded-full"
              >
                <BellIcon className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent
            align="end"
            className="min-h-52 min-w-60 p-0 sm:min-w-72"
          >
            <h2 className="border-b p-4 py-2 text-base font-semibold">
              Notifications {`(${notifications.length})`}
            </h2>
            <ul className="flex flex-col gap-2 divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-muted-foreground">
                      {notification.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <TooltipContent align="center" side="left" showArrow>
          Notifications
        </TooltipContent>
      </Tooltip>
    </header>
  )
}
