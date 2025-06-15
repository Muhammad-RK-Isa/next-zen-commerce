import { Button, buttonVariants } from "@nzc/ui/components/button"
import { cn } from "@nzc/ui/lib/utils"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { User2Icon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { Image } from "~/components/image"

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.orpc.auth.session.queryOptions()
    )
    return
  },
  pendingComponent: () => (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <Loader2Icon className="animate-spin" />
    </div>
  ),
})

function RouteComponent() {
  const navigate = useNavigate()
  const router = useRouter()

  const { orpc, queryClient } = Route.useRouteContext()
  const { data: session } = useSuspenseQuery(orpc.auth.session.queryOptions())

  const { mutate: signOut } = useMutation(
    orpc.auth.signOut.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.auth.session.queryOptions())
        router.invalidate()
      },
    })
  )

  return (
    <div className="flex min-h-screen w-screen items-center justify-center relative flex-col space-y-4">
      {session?.session ? (
        <div className="w-sm md:w-lg lg:w-xl space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {session?.user?.avatar ? (
                <Image
                  src={session?.user?.avatar}
                  width={48}
                  height={48}
                  layout="fixed"
                  alt="User Avatar"
                  className="rounded-full"
                />
              ) : (
                <User2Icon />
              )}
              <div>
                <p>{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => signOut({})}>
              Sign out
            </Button>
          </div>
          <pre className="border rounded-md bg-accent/40 w-full p-4 break-words text-wrap text-muted-foreground">
            Session: {JSON.stringify(session, null, 2)}
          </pre>
          <div className="flex items-center justify-center">
            <Link
              to="/overview"
              className={cn(buttonVariants({ variant: "link" }))}
            >
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-blue-500 bg-clip-text font-mono tracking-tighter font-bold text-6xl text-transparent hover:tracking-normal transition-all duration-300">
            Next Zen Commerce
          </h1>
          <Button
            variant="link"
            className="absolute top-4 right-4"
            onMouseDown={() => navigate({ to: "/sign-in" })}
          >
            Sign In
          </Button>
        </>
      )}
    </div>
  )
}
