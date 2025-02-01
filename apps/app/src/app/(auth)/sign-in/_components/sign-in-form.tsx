"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, MailIcon, PhoneIcon } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { toast } from "sonner";

import type { AppSignInEmailPasswordInput } from "@nzc/validators/app";
import { Button } from "@nzc/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
} from "@nzc/ui/components/form";
import { Input } from "@nzc/ui/components/input";
import { TextShine } from "@nzc/ui/components/text-shine";
import { cn } from "@nzc/ui/utils/cn";
import { appSignInEmailPasswordSchema } from "@nzc/validators/app";

import { GoogleIcon } from "~/components/google-icon";
import { APP_TITLE } from "~/lib/constants";
import { api } from "~/trpc/react";

interface SignInFormProps {
  callbackUrl: string;
  identifier?: string;
  method: "email" | "phone";
}

export function SignInForm({
  callbackUrl,
  identifier,
  method,
}: SignInFormProps) {
  const router = useRouter();

  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<AppSignInEmailPasswordInput>({
    resolver: zodResolver(appSignInEmailPasswordSchema),
    defaultValues: {
      identifier: identifier ?? "",
      password: "",
      method,
    },
  });

  const {
    mutate: signInEmailPassword,
    isPending: isSigningInWIthEmailPassword,
  } = api.auth.signInEmailPassword.useMutation({
    onSuccess: () => {
      router.replace(callbackUrl);
    },
    onError: (error) => {
      if (error.data?.code === "NOT_FOUND") {
        router.push(
          `/sign-up?${new URLSearchParams({
            callbackUrl: encodeURIComponent(callbackUrl),
            identifier: encodeURIComponent(form.getValues("identifier")),
          })}`,
        );
        return;
      }
      setError(error.message);
    },
  });

  function handleSubmit(data: AppSignInEmailPasswordInput) {
    signInEmailPassword(data);
  }

  // function onMethodChange(method: "email" | "phone") {
  //   router.push(
  //     `/sign-in?${new URLSearchParams({
  //       callbackUrl: encodeURIComponent(callbackUrl),
  //       method,
  //     })}`,
  //     { scroll: false },
  //   );
  //   form.reset();
  //   form.setValue("method", method);
  // }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="w-[20rem] rounded-xl border bg-card/50 text-card-foreground shadow-none backdrop-blur-sm sm:w-[24rem]"
    >
      <CardHeader className="pb-6">
        <CardTitle className="text-xl sm:text-2xl">Sign in</CardTitle>
        <CardDescription className="inline-flex items-center gap-1 text-muted-foreground">
          to continue to{" "}
          <TextShine
            duration={10}
            text={APP_TITLE}
            className={cn("text-sm font-bold transition-all")}
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              name="identifier"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <FormItem className="space-y-0">
                    <FormControl>
                      {method === "email" ? (
                        <FormInput
                          {...field}
                          type="email"
                          inputMode="email"
                          placeholder="Email"
                          className="h-10"
                        />
                      ) : (
                        <RPNInput.default
                          {...field}
                          className="flex h-10 rounded-lg tracking-wider shadow-sm shadow-input placeholder:tracking-wider"
                          numberInputProps={{
                            className: cn(
                              "h-10",
                              fieldState.error
                                ? "border-destructive hover:border-destructive hover:focus-within:border-destructive focus-visible:border-destructive focus-visible:ring-destructive"
                                : "",
                            ),
                          }}
                          inputComponent={Input}
                          placeholder="01XXX-XXXXXX"
                          countrySelectProps={{ className: "hidden" }}
                          international={false}
                          countries={["BD"]}
                          defaultCountry="BD"
                        />
                      )}
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <div className="relative">
                      <FormInput
                        {...field}
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        className="h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOffIcon
                            className="size-4 text-muted-foreground transition-all hover:text-primary"
                            aria-hidden="true"
                          />
                        ) : (
                          <EyeIcon
                            className="size-4 text-muted-foreground transition-all hover:text-primary"
                            aria-hidden="true"
                          />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {(error || Object.keys(form.formState.errors).length > 0) && (
              <ul className="list-disc space-y-1 overflow-hidden rounded-lg border border-destructive/60 bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {Object.values(form.formState.errors).map(
                  ({ message }, idx) => (
                    <li className="ml-4" key={idx}>
                      {message}
                    </li>
                  ),
                )}
                {error && <li className="ml-4">{error}</li>}
              </ul>
            )}
            <Button
              loader="dots"
              iconPosition="right"
              className="w-full"
              size="lg"
              disabled={isSigningInWIthEmailPassword}
              loading={isSigningInWIthEmailPassword}
            >
              Continue
            </Button>
            <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
            {/* TODO: Uncomment this when we have a way to login with phone number */}
            {/* <Button
              size="lg"
              variant="secondary"
              type="button"
              icon={method === "phone" ? <MailIcon /> : <PhoneIcon />}
              className="w-full border dark:border-2"
              onClick={() =>
                onMethodChange(method === "email" ? "phone" : "email")
              }
            >
              Continue with {method === "email" ? "phone" : "email"}
            </Button> */}
            <Button
              size="lg"
              variant="secondary"
              type="button"
              icon={<GoogleIcon />}
              className="w-full border dark:border-2"
              onClick={() => toast.info("Yet to be implemented.")}
            >
              Continue with Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </motion.div>
  );
}
