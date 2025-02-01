import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-path") ?? "/";

  const hasStore = await api.store.hasStore.query();

  if (!hasStore && pathname !== "/store/create") {
    return redirect("/store/create");
  }

  return <>{children}</>;
}
