import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";

import { appAuthSearchParamsSchema } from "@nzc/validators/app";

import type { SearchParams } from "~/lib/types";
import { APP_TITLE } from "~/lib/constants";
import { SignUpForm } from "./_components/sign-up-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Sign Up - ${APP_TITLE}`,
  description: `Create an account to continue to ${APP_TITLE}`,
};

interface SignUpPageProps {
  searchParams: SearchParams;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error, data } = appAuthSearchParamsSchema.safeParse(
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
    <React.Suspense
      fallback={<div className="z-50 text-foreground">Loading react...</div>}
    >
      <SignUpForm {...decoded} />
    </React.Suspense>
  );
}
