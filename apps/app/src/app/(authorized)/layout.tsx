import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HydrationBoundary } from "@tanstack/react-query";

import { trpcServerUtils } from "~/trpc/server";

export default async function AuthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await trpcServerUtils.auth.session.fetch();

  const pathname = (await headers()).get("x-path") ?? "/";

  if (!user)
    return redirect(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);

  return (
    <HydrationBoundary state={trpcServerUtils.dehydrate()}>
      {children}
    </HydrationBoundary>
  );
}
