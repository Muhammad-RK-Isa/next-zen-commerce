import { create } from "zustand"
import { type Breadcrumb, generateBreadcrumbs } from "~/lib/breadcrumbs"
import type { FileRoutesByTo } from "~/routeTree.gen"

interface BreadcrumbState {
  breadcrumbs: Breadcrumb[]
  setBreadcrumbsFromPath: (path: keyof FileRoutesByTo) => void
  updateBreadcrumb: (index: number, breadcrumb: Partial<Breadcrumb>) => void
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  addBreadcrumb: (breadcrumb: Breadcrumb) => void
  resetBreadcrumbs: () => void
}

export const useBreadcrumbsStore = create<BreadcrumbState>((set) => ({
  breadcrumbs: [],

  setBreadcrumbsFromPath: (path) => {
    const generatedBreadcrumbs = generateBreadcrumbs(path)
    set({ breadcrumbs: generatedBreadcrumbs })
  },

  updateBreadcrumb: (index, breadcrumb) => {
    set((state) => ({
      breadcrumbs: state.breadcrumbs.map((crumb, i) =>
        i === index ? { ...crumb, ...breadcrumb } : crumb
      ),
    }))
  },

  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs })
  },

  addBreadcrumb: (breadcrumb) => {
    set((state) => ({
      breadcrumbs: [...state.breadcrumbs, breadcrumb],
    }))
  },

  resetBreadcrumbs: () => {
    set({ breadcrumbs: [] })
  },
}))
