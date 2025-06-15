"use client"

import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import {
  CheckIcon,
  LogOut,
  MonitorIcon,
  MoonStarIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@nzc/ui/components/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@nzc/ui/components/avatar"
import { buttonVariants } from "@nzc/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@nzc/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@nzc/ui/components/sidebar"
import { Spinner } from "@nzc/ui/components/spinner"
import { cn } from "@nzc/ui/lib/utils"
import { useRouteContext, useRouter } from "@tanstack/react-router"

export function NavUser() {
  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { theme: currentTheme, setTheme } = useTheme()

  const [isAlertOpen, setIsAlertOpen] = React.useState(false)

  const { data: session } = useSuspenseQuery(orpc.auth.session.queryOptions())

  const { mutate: signOut, isPending: isSigningOut } = useMutation(
    orpc.auth.signOut.mutationOptions({
      onSuccess: async () => {
        setIsAlertOpen(false)
        await queryClient.invalidateQueries(orpc.auth.session.queryOptions())
        await router.invalidate()
      },
    })
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={session?.user?.avatar ?? ""}
                    alt={session?.user?.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {session?.user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session?.user?.name}
                  </span>
                  <span className="truncate text-xs">
                    {session?.user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "top"}
              align="center"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={session?.user?.avatar ?? ""}
                      alt={session?.user?.name ?? ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.name}
                    </span>
                    <span className="truncate text-xs">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRoundIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    fill="none"
                    className="text-primary"
                  >
                    <g clipPath="url(#a)">
                      <circle
                        cx="7.5"
                        cy="7.5"
                        r="6.443"
                        stroke="currentColor"
                        strokeWidth="1.333"
                      />
                      <path
                        fill="currentColor"
                        d="M7.5 11.944a4.444 4.444 0 0 0 0-8.888z"
                      />
                    </g>
                    <defs>
                      <clipPath id="a">
                        <path fill="#fff" d="M0 0h15v15H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="capitalize"
                      onClick={() => setTheme("light")}
                    >
                      <SunIcon className="size-4" />
                      Light
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          currentTheme === "light" ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="capitalize"
                      onClick={() => setTheme("dark")}
                    >
                      <MoonStarIcon className="size-4" />
                      Dark
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          currentTheme === "dark" ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="capitalize"
                      onClick={() => setTheme("system")}
                    >
                      <MonitorIcon className="size-4" />
                      System
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          currentTheme === "system"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to sign out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your current session will be terminated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  signOut({})
                }}
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                {isSigningOut ? <Spinner /> : null}
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
