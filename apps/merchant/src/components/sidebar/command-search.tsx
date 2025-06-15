"use client"

import {
  BoxIcon,
  ChartLineIcon,
  LayersIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  ShoppingCartIcon,
  StoreIcon,
  SunIcon,
  TagIcon,
  User2Icon,
} from "lucide-react"
import React from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@nzc/ui/components/command"
import { SidebarMenuButton } from "@nzc/ui/components/sidebar"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "next-themes"

export function CommandSearch() {
  const [open, setOpen] = React.useState(false)

  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <SidebarMenuButton
        className="border bg-sidebar-accent/40 hover:bg-sidebar-accent/80 border-input mb-3 h-9"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        Search{" "}
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </SidebarMenuButton>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        containerClassName="w-[calc(100vw-_var(--spacing)*4))]"
      >
        <div className="relative">
          <CommandInput placeholder="Type a command or search..." />
          <span className="pointer-events-none absolute right-4 top-1/2 h-5 w-max -translate-y-1/2 select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            Esc
          </span>
        </div>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Dashboard">
            <CommandItem
              onSelect={() => {
                navigate({ to: "/overview" })
                setOpen(false)
              }}
            >
              <ChartLineIcon className="!size-4" />
              <span>Overview</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate({ to: "/orders" })
                setOpen(false)
              }}
            >
              <ShoppingCartIcon className="!size-4" />
              <span>Orders</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Product">
            <CommandItem
              onSelect={() => {
                navigate({ to: "/products" })
                setOpen(false)
              }}
            >
              <BoxIcon className="!size-4" />
              <span>Products</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate({ to: "/inventory" })
                setOpen(false)
              }}
            >
              <LayersIcon className="!size-4" />
              <span>Inventory</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate({ to: "/categories" })
                setOpen(false)
              }}
            >
              <TagIcon className="!size-4" />
              <span>Categories</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                navigate({ to: "/settings/general" })
                setOpen(false)
              }}
            >
              <StoreIcon className="!size-4" />
              <span>General</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate({ to: "/account" })
                setOpen(false)
              }}
            >
              <User2Icon className="!size-4" />
              <span>Account</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme(theme === "light" ? "dark" : "light")
                setOpen(false)
              }}
            >
              {theme === "light" ? (
                <MoonIcon className="!size-4" />
              ) : (
                <SunIcon className="!size-4" />
              )}
              <span>Turn {theme === "light" ? "dark" : "light"} mode on</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("system")
                setOpen(false)
              }}
            >
              <MonitorIcon className="!size-4" />
              <span>Follow the system theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
