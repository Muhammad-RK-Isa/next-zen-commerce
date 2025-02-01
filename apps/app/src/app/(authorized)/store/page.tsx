import { redirect } from "next/navigation";

import { trpcServerUtils } from "~/trpc/server";

export default async function StorePage() {
  const stores = await trpcServerUtils.store.listStores.fetch();

  if (stores.length === 0) return redirect("/store/create");

  return redirect(`/store/${stores[0]!.handle}/dashboard`);
}
