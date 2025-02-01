import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";

import { appAuthSearchParamsSchema } from "@nzc/validators/app";

import type { SearchParams } from "~/lib/types";
import { APP_TITLE } from "~/lib/constants";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: `Sign In - ${APP_TITLE}`,
  description: `Sign in to continue to ${APP_TITLE}`,
};

interface SignInPageProps {
  searchParams: SearchParams;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { data, error } = appAuthSearchParamsSchema.safeParse(
    await searchParams,
  );

  if (error) {
    return notFound();
  }

  const decoded = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, decodeURIComponent(value)];
      }
      return [key, value];
    }),
  ) as typeof data;

  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  if (data.method === "phone") {
    const passed = phoneRegex.test(decoded.identifier ?? "");
    if (!passed) {
      delete decoded.identifier;
    }
  }

  if (data.method === "email") {
    const passed = emailRegex.test(decoded.identifier ?? "");
    if (!passed) {
      delete decoded.identifier;
    }
  }

  return (
    <React.Suspense>
      <SignInForm {...decoded} />
    </React.Suspense>
  );
}
