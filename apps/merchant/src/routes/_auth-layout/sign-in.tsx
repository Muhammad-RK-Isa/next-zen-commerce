import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nzc/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nzc/ui/components/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@nzc/ui/components/form"
import { Input } from "@nzc/ui/components/input"
import { signInSchema } from "@nzc/validators/merchant"
import type { SignInSchemaType } from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation } from "@tanstack/react-query"
import {
  HeadContent,
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { AtSignIcon, PencilIcon } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { siteConfig } from "~/configs/site"
import { genPageTitle } from "~/lib/utils"
import { SocialSignIn } from "../../components/social-sign-in"

export const Route = createFileRoute("/_auth-layout/sign-in")({
  component: SignInComponent,
  head: () => ({
    meta: [
      {
        name: "description",
        content: siteConfig.description,
      },
      {
        title: genPageTitle("Sign In"),
      },
    ],
  }),
})

function SignInComponent() {
  const navigate = useNavigate()
  const [isNameDialogOpen, setIsNameDialogOpen] = React.useState(false)

  const { orpc } = Route.useRouteContext()
  const { redirectPath } = Route.useSearch()

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutate: signIn, isPending: isSigningIn } = useMutation(
    orpc.auth.signInEmail.mutationOptions({
      onSuccess: async () => {
        await navigate({
          to: "/auth-verification",
          search: { redirectPath, identifier: form.getValues("email") },
        })
        toast.success("Verification code sent to your email.", {
          description: "Check your inbox and spam folders for the code.",
        })
      },
      onError: async (error) => {
        if (isDefinedError(error)) {
          if (error.code === "NOT_FOUND") {
            setIsNameDialogOpen(true)
            return
          }
          if (error.code === "BAD_REQUEST") {
            form.setError("email", { message: error.message })
            return
          }
        }
        toast.error(error.message)
      },
    })
  )

  const handleSubmit = form.handleSubmit((data) => {
    signIn(data)
  })

  return (
    <>
      <HeadContent />
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>to continue to {siteConfig.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="peer ps-9"
                          placeholder="Email"
                          type="email"
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <AtSignIcon size={16} aria-hidden="true" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                loading={isSigningIn}
                disabled={isSigningIn}
              >
                {isSigningIn ? "Processing" : "Continue"}
              </Button>
            </form>
          </Form>
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <SocialSignIn />
        </CardContent>
      </Card>
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seems like you're not registered yet. 🤔</DialogTitle>
            <DialogDescription>
              Please create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2.5 justify-end">
            <Button
              type="button"
              variant="outline"
              icon={<PencilIcon />}
              onMouseDown={() => {
                setIsNameDialogOpen(false)
                setTimeout(() => {
                  form.setFocus("email")
                }, 0)
              }}
            >
              Change email
            </Button>
            <Button
              type="button"
              onMouseDown={async () => {
                await navigate({
                  to: "/sign-up",
                  search: { redirectPath, email: form.getValues("email") },
                })
              }}
            >
              Sign up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <p className="text-muted-foreground text-sm text-center mt-4">
        Don't have an account?{" "}
        <Link
          to="/sign-up"
          className="underline text-primary"
          search={{ redirectPath }}
        >
          Sign up
        </Link>
      </p>
    </>
  )
}
