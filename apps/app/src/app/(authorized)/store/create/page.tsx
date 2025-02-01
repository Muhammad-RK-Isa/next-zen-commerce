import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card";

import { api } from "~/trpc/server";
import { StoreCreateForm } from "./_components/store-create-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create store",
  description: "Create a store to sell your products",
};

export default async function () {
  const hasStore = await api.store.hasStore.query();

  const title = hasStore ? "Create a new store" : "Create your first store";

  return (
    <main className="w-ful relative flex min-h-screen items-center justify-center bg-background bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]">
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <Card className="z-10 w-[24rem]">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreCreateForm />
        </CardContent>
      </Card>
    </main>
  );
}
