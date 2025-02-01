"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MailIcon, PhoneIcon } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { toast } from "sonner";

import type { ProgressStatus } from "@nzc/ui/components/progress-tabs";
import type { AppSignUpEmailPasswordInput } from "@nzc/validators/app";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@nzc/ui/components/input-otp";
import { ProgressTabs } from "@nzc/ui/components/progress-tabs";
import { TextShine } from "@nzc/ui/components/text-shine";
import { cn } from "@nzc/ui/utils/cn";
import { appSignUpEmailPasswordSchema } from "@nzc/validators/app";

import { APP_TITLE } from "~/lib/constants";
import { api } from "~/trpc/react";

type Tab = "details" | "otp" | "password";

type StepStatus = Record<Tab, ProgressStatus>;

interface SignUpFormProps {
  method: "email" | "phone";
  identifier?: string;
  callbackUrl: string;
}

export function SignUpForm({
  method,
  identifier = "",
  callbackUrl,
}: SignUpFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("details");

  const title =
    tab === "details"
      ? "Create an account"
      : tab === "otp"
        ? "Enter verification code"
        : "Set a password";

  const description =
    tab === "details" ? (
      <>
        to continue to{" "}
        <TextShine
          duration={10}
          text={APP_TITLE}
          className={cn("text-sm font-bold transition-all")}
        />
      </>
    ) : tab === "otp" ? (
      "A verification code has been sent to your email"
    ) : (
      "to finish creating your account"
    );

  const form = useForm<AppSignUpEmailPasswordInput>({
    defaultValues: {
      name: "",
      identifier,
      password: "",
    },
    resolver: zodResolver(appSignUpEmailPasswordSchema),
  });

  const { mutateAsync: lookUpAccountAsync, isPending: isLookingUpAccount } =
    api.auth.lookUpAccount.useMutation();

  const {
    mutateAsync: sendVerificationCodeAsync,
    isPending: isSendingVerificationCode,
  } = api.auth.sendVerificationCode.useMutation();

  const {
    data: codeVerification,
    mutateAsync: validateVerificationCodeAsync,
    isPending: isVerifyingCode,
  } = api.auth.validateVerificationCode.useMutation({
    onMutate: () => {
      setError("");
    },
    onError: (err) => {
      if (err.data?.code === "NOT_FOUND") {
        setError(err.message);
      }
    },
  });

  const { mutate: signUpWithEmailPassword, isPending } =
    api.auth.signUpEmailPassword.useMutation({
      onSuccess: () => {
        toast.success("You are now signed in");
        router.push(callbackUrl);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      (!Object.keys(form.formState.errors).length || !error) &&
      tab !== "password"
    ) {
      await onNext();
      return;
    }
    console.log("VALUES_BEING_SUBMITTED: ", form.getValues());
    signUpWithEmailPassword({
      ...form.getValues(),
      method,
    });
  }

  const [_, setStatus] = React.useState<StepStatus>({
    otp: "not-started",
    password: "not-started",
    details: "not-started",
  });

  const onTabChange = React.useCallback(
    async (value: Tab) => {
      let result = false;
      switch (value) {
        case "details":
          result = await form.trigger(["identifier"]);
          break;
        case "otp":
          result = await form.trigger(["verificationCode"]);
          break;
        case "password":
          result = await form.trigger(["password", "confirmPassword"]);
      }

      if (!result) {
        return;
      }

      setTab(value);
    },
    [form.trigger],
  );

  const onNext = React.useCallback(async () => {
    let result = false;
    switch (tab) {
      case "details":
        result = await form.trigger(["identifier"]);
        break;
      case "otp":
        result = await form.trigger(["verificationCode"]);
        break;
      case "password":
        result = await form.trigger(["password", "confirmPassword"]);
    }

    if (!result) {
      return;
    }

    switch (tab) {
      case "details": {
        await lookUpAccountAsync(
          { email: form.getValues("identifier") },
          {
            onError: (err) => {
              if (err.data?.code === "CONFLICT") {
                router.push(
                  `/sign-in?${new URLSearchParams({
                    callbackUrl,
                    identifier: form.getValues("identifier"),
                  })}`,
                );
              }
              toast.error(err.message);
            },
          },
        );
        await sendVerificationCodeAsync(
          { email: form.getValues("identifier") },
          {
            onError: (err) => {
              setError(err.message);
              return;
            },
          },
        );
        setTab("otp");
        break;
      }
      case "otp":
        if (!codeVerification?.success) {
          await validateVerificationCodeAsync(
            {
              identifier: form.getValues("identifier"),
              code: form.getValues("verificationCode"),
            },
            {
              onError: () => {
                return;
              },
              onSuccess: () => {
                setTab("password");
              },
            },
          );
        }
        break;
      case "password":
        break;
    }
  }, [tab, form.trigger]);

  function onMethodChange(method: "email" | "phone") {
    router.push(
      `/sign-up?${new URLSearchParams({
        callbackUrl: encodeURIComponent(callbackUrl),
        method,
      })}`,
      { scroll: false },
    );
    form.reset();
    form.setValue("method", method);
  }

  React.useEffect(() => {
    if (form.formState.isDirty) {
      setStatus((prev) => ({ ...prev, details: "in-progress" }));
    } else {
      setStatus((prev) => ({ ...prev, details: "not-started" }));
    }
  }, [form.formState.isDirty]);

  React.useEffect(() => {
    if (tab === "details" && form.formState.isDirty) {
      setStatus((prev) => ({ ...prev, details: "in-progress" }));
    }

    if (tab === "otp") {
      setStatus((prev) => ({
        ...prev,
        details: "completed",
        ["otp"]: "in-progress",
      }));
    }
    if (tab === "password") {
      setStatus((prev) => ({
        ...prev,
        ["otp"]: "completed",
        ["password"]: "in-progress",
      }));
    }
  }, [tab, form.formState.isDirty]);

  React.useEffect(() => {
    form.clearErrors();
  }, [form.watch("password"), form.watch("confirmPassword")]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="w-[20rem] rounded-xl border bg-card/50 text-card-foreground shadow-none backdrop-blur-sm sm:w-[24rem]"
    >
      <CardHeader className="pb-6">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="inline-flex items-center gap-1 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <ProgressTabs
            value={tab}
            onValueChange={(tab) => onTabChange(tab as Tab)}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <ProgressTabs.Content value="details" className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <FormInput
                          {...field}
                          placeholder="Name"
                          className="h-10"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
              </ProgressTabs.Content>
              <ProgressTabs.Content value="otp">
                <FormField
                  name="verificationCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex w-full items-center justify-center">
                          <InputOTP
                            maxLength={6}
                            {...field}
                            onComplete={async () => {
                              await validateVerificationCodeAsync(
                                {
                                  identifier: form.getValues("identifier"),
                                  code: field.value,
                                },
                                {
                                  onSuccess: () => {
                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                    onNext();
                                  },
                                },
                              );
                            }}
                            className="text-lg"
                          >
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={0}
                                className="size-10 sm:size-12"
                              />
                              <InputOTPSlot
                                index={1}
                                className="size-10 sm:size-12"
                              />
                              <InputOTPSlot
                                index={2}
                                className="size-10 sm:size-12"
                              />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={3}
                                className="size-10 sm:size-12"
                              />
                              <InputOTPSlot
                                index={4}
                                className="size-10 sm:size-12"
                              />
                              <InputOTPSlot
                                index={5}
                                className="size-10 sm:size-12"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </ProgressTabs.Content>
              <ProgressTabs.Content value="password" className="space-y-4">
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
                              <EyeOff
                                className="size-4 text-muted-foreground transition-all hover:text-primary"
                                aria-hidden="true"
                              />
                            ) : (
                              <Eye
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
                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <div className="relative">
                          <FormInput
                            {...field}
                            placeholder="Retype Password"
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
                              <EyeOff
                                className="size-4 text-muted-foreground transition-all hover:text-primary"
                                aria-hidden="true"
                              />
                            ) : (
                              <Eye
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
              </ProgressTabs.Content>
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
                disabled={
                  isPending ||
                  isVerifyingCode ||
                  isLookingUpAccount ||
                  isSendingVerificationCode
                }
                loading={
                  isPending ||
                  isVerifyingCode ||
                  isLookingUpAccount ||
                  isSendingVerificationCode
                }
                loader="dots"
                iconPosition="right"
                className="w-full"
                size="lg"
              >
                {isPending ||
                isVerifyingCode ||
                isLookingUpAccount ||
                isSendingVerificationCode
                  ? isVerifyingCode
                    ? "Verifying code"
                    : isLookingUpAccount || isSendingVerificationCode
                      ? "Processing"
                      : "Creating account"
                  : "Continue"}
              </Button>
              <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
              <Button
                size="lg"
                variant="secondary"
                type="button"
                icon={method === "phone" ? <MailIcon /> : <PhoneIcon />}
                className="w-full border dark:border-2"
                onClick={() =>
                  onMethodChange(method === "email" ? "phone" : "email")
                }
                disabled={isLookingUpAccount || isPending || isVerifyingCode}
              >
                Continue with {method === "email" ? "phone" : "email"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                type="button"
                className="w-full border dark:border-2"
                onClick={() => toast.info("Yet to be implemented.")}
                disabled={isLookingUpAccount || isPending || isVerifyingCode}
              >
                Continue with Google
              </Button>
            </form>
          </ProgressTabs>
        </Form>
      </CardContent>
    </motion.div>
  );
}
