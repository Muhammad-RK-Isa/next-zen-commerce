"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, UserRoundIcon } from "lucide-react";
import { useTheme } from "next-themes";

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
} from "@nzc/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@nzc/ui/components/avatar";
import { buttonVariants } from "@nzc/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@nzc/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@nzc/ui/components/sidebar";
import { Skeleton } from "@nzc/ui/components/skeleton";
import { Spinner } from "@nzc/ui/components/spinner";
import { cn } from "@nzc/ui/utils/cn";

import { api } from "~/trpc/react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { theme: currentTheme, themes, setTheme } = useTheme();

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const { data: session, isPending } = api.auth.session.useQuery();

  const { mutate: signOut, isPending: isSigningOut } =
    api.auth.signOut.useMutation({
      onSuccess: () => {
        setIsAlertOpen(false);
        router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      },
    });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isPending ? (
                <Skeleton className="h-12 w-60 rounded-lg" />
              ) : (
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
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
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
              <Link href="/account">
                <DropdownMenuItem>
                  <UserRoundIcon />
                  Account
                </DropdownMenuItem>
              </Link>
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
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M7.5 11.944a4.444 4.444 0 0 0 0-8.888z"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="a">
                        <path fill="#fff" d="M0 0h15v15H0z"></path>
                      </clipPath>
                    </defs>
                  </svg>
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={currentTheme}
                    onValueChange={setTheme}
                  >
                    {themes.map((theme) => (
                      <DropdownMenuRadioItem
                        key={theme}
                        value={theme}
                        className="capitalize"
                      >
                        {theme}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
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
                  e.preventDefault();
                  signOut();
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
  );
}
