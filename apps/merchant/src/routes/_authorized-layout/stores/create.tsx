import { zodResolver } from "@hookform/resolvers/zod"
import { AuroraBackground } from "@nzc/ui/components/aurora-background"
import { Button } from "@nzc/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@nzc/ui/components/form"
import { Input } from "@nzc/ui/components/input"
import type { StoreCreateSchemaType } from "@nzc/validators/merchant"
import { storeCreateSchema } from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import { CornerDownLeftIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const storeCreateSearchSchema = z.object({
  redirectPath: fallback(z.string(), "/").default("/"),
})

export const Route = createFileRoute("/_authorized-layout/stores/create")({
  validateSearch: zodValidator(storeCreateSearchSchema),
  component: RouteComponent,
  loader: async ({ context }) => {
    const hasStore = await context.queryClient.ensureQueryData(
      context.orpc.store.hasStore.queryOptions()
    )
    return { hasStore }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { orpc, queryClient } = Route.useRouteContext()
  const { hasStore } = Route.useLoaderData()
  const { redirectPath } = Route.useSearch()

  const form = useForm<StoreCreateSchemaType>({
    resolver: zodResolver(storeCreateSchema),
  })

  const { mutate: createStore, isPending } = useMutation(
    orpc.store.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.refetchQueries()
        await navigate({
          to: redirectPath,
        })
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message)
        }
      },
    })
  )

  const handleSubmit = form.handleSubmit((data) => {
    createStore(data)
  })

  return (
    <AuroraBackground className="flex items-center justify-center flex-col">
      <Card className="sm:w-sm z-10 bg-card/80 backdrop-blur-sm drop-shadow-sm">
        <CardHeader>
          <CardTitle>
            {hasStore ? "Create a new store" : "Create your first store"}
          </CardTitle>
          <CardDescription>to start selling your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Store name"
                        className="shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                size="lg"
                icon={<CornerDownLeftIcon />}
                iconPosition="right"
                className="w-full"
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Creating store" : "Done"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuroraBackground>
  )
}
