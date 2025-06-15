import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nzc/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card"
import { Form, FormControl, FormField, FormItem } from "@nzc/ui/components/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@nzc/ui/components/input-otp"
import type { VerificationCodeSchemaType } from "@nzc/validators/merchant"
import { verificationCodeSchema } from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const authVerificationSearchSchema = z.object({
  identifier: z.string(),
})

export const Route = createFileRoute("/_auth-layout/auth-verification")({
  component: RouteComponent,
  validateSearch: zodValidator(authVerificationSearchSchema),
})

function RouteComponent() {
  const { orpc, queryClient } = Route.useRouteContext()
  const { identifier, redirectPath } = Route.useSearch()
  const navigate = useNavigate()

  const form = useForm<VerificationCodeSchemaType>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: "",
      identifier,
    },
  })

  const { mutate, isPending } = useMutation(
    orpc.auth.verifyAuthCode.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.auth.session.key(),
        })
        await navigate({ to: redirectPath })
        toast.success("Code verified successfully.", {
          description: "You are now signed in.",
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
    mutate(data)
  })

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Verfiy your code</CardTitle>
        <CardDescription>
          Please enter the verification code that was sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      {...field}
                      maxLength={6}
                      minLength={6}
                      disabled={isPending}
                      onComplete={handleSubmit}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="grow"
                disabled={isPending}
                onMouseDown={() =>
                  navigate({ to: "/sign-in", search: { redirectPath } })
                }
              >
                Back to sign in
              </Button>
              <Button className="grow" disabled={isPending} loading={isPending}>
                {isPending ? "Verifying" : "Verify"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
