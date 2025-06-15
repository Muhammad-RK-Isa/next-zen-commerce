import type { FileRoutesByTo } from "~/routeTree.gen"

export interface Breadcrumb {
  label: string
  path: keyof FileRoutesByTo
}

export function generateBreadcrumbs(path: keyof FileRoutesByTo): Breadcrumb[] {
  let crumbs: Breadcrumb[] = [] as const

  switch (path) {
    case "/orders":
      crumbs = [{ label: "Orders", path }]
      break
    case "/orders/create":
      crumbs = [
        { label: "Orders", path: "/orders" },
        { label: "Create", path },
      ]
      break
    case "/orders/$id":
      crumbs = [
        { label: "Orders", path: "/orders" },
        { label: "Details", path },
      ]
      break
    case "/products":
      crumbs = [{ label: "Products", path }]
      break
    case "/inventory":
      crumbs = [{ label: "Inventory", path }]
      break
    case "/categories":
      crumbs = [{ label: "Categories", path }]
      break
    case "/collections":
      crumbs = [{ label: "Collections", path }]
      break
    case "/customers":
      crumbs = [{ label: "Customers", path }]
      break
    case "/files":
      crumbs = [{ label: "Files", path }]
      break
    case "/settings":
      crumbs = [{ label: "Settings", path }]
      break
    case "/settings/general":
      crumbs = [
        { label: "Settings", path: "/settings" },
        { label: "General", path },
      ]
      break
    case "/account":
      crumbs = [{ label: "Account", path }]
      break
    case "/overview":
    default:
      crumbs = [{ label: "Overview", path }]
      break
  }
  return crumbs
}
