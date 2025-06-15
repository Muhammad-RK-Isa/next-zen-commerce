import { cn } from "@nzc/ui/lib/utils"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const authSearchSchema = z.object({
  redirectPath: fallback(z.string(), "/").default("/"),
})

export const Route = createFileRoute("/_auth-layout")({
  validateSearch: zodValidator(authSearchSchema),
  component: AuthLayoutComponent,
  beforeLoad: async ({ context, search }) => {
    const { session } = await context.queryClient.ensureQueryData(
      context.orpc.auth.session.queryOptions()
    )
    if (session) {
      throw redirect({
        to: search.redirectPath,
      })
    }
  },
})

function AuthLayoutComponent() {
  return (
    <div className="grid place-content-center min-h-screen w-screen">
      <div className="z-10">
        <Outlet />
      </div>
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
    </div>
  )
}
