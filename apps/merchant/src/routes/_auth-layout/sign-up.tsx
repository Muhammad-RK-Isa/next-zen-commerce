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
import { type SignUpSchemaType, signUpSchema } from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation } from "@tanstack/react-query"
import { HeadContent, Link, useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { AtSignIcon, PencilIcon } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { siteConfig } from "~/configs/site"
import { genPageTitle } from "~/lib/utils"
import { SocialSignIn } from "../../components/social-sign-in"

const signUpSearchSchema = z.object({ email: z.string().email().optional() })

export const Route = createFileRoute("/_auth-layout/sign-up")({
  component: RouteComponent,
  validateSearch: zodValidator(signUpSearchSchema),
  head: () => ({
    meta: [
      {
        name: "description",
        content: siteConfig.description,
      },
      {
        title: genPageTitle("Sign Up"),
      },
    ],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { orpc } = Route.useRouteContext()
  const { redirectPath, email } = Route.useSearch()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = React.useState(false)

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email,
      name: "",
    },
  })

  const { mutate: signUp, isPending: isSigningUp } = useMutation(
    orpc.auth.signUpEmail.mutationOptions({
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
        if (isDefinedError(error) && error.code === "CONFLICT") {
          setIsSignInDialogOpen(true)
          return
        }
        toast.error(error.message)
      },
    })
  )

  const { mutate: signIn, isPending: isSigningIn } = useMutation(
    orpc.auth.signInEmail.mutationOptions({
      onSuccess: async () => {
        toast.success("Verification code sent to your email.", {
          description: "Check your inbox and spam folders for the code.",
        })
        setIsSignInDialogOpen(false)
        await navigate({
          to: "/auth-verification",
          search: { redirectPath, identifier: form.getValues("email") },
        })
      },
      onError: async (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message)
        }
      },
    })
  )

  const handleSubmit = form.handleSubmit((data) => {
    signUp(data)
  })

  return (
    <>
      <HeadContent />
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>to continue to {siteConfig.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                loading={isSigningUp}
                disabled={isSigningUp}
              >
                {isSigningUp ? "Processing" : "Continue"}
              </Button>
            </form>
          </Form>
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <SocialSignIn />
        </CardContent>
      </Card>
      <Dialog open={isSignInDialogOpen} onOpenChange={setIsSignInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seems like you are already registered. 🤔</DialogTitle>
            <DialogDescription>Do you want to sign in?</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2.5 justify-end">
            <Button
              type="button"
              variant="outline"
              icon={<PencilIcon />}
              onMouseDown={() => {
                setIsSignInDialogOpen(false)
                setTimeout(() => {
                  form.setFocus("email")
                }, 0)
              }}
            >
              Change email
            </Button>
            <Button
              type="button"
              disabled={isSigningIn}
              loading={isSigningIn}
              onClick={() => signIn({ email: form.getValues("email") })}
            >
              {isSigningIn ? "Signing in" : "Sign in"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <p className="text-muted-foreground text-sm text-center mt-4">
        Already have account?{" "}
        <Link
          to="/sign-in"
          className="underline text-primary"
          search={{ redirectPath }}
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
