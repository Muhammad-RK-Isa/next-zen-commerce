import { api } from "~/trpc/server";

interface DashboardPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const store = await api.store.getByHandle.query((await params).handle);
  const stores = await api.store.listStores.query();
  return (
    <main className="mx-auto flex min-h-screen w-max flex-col items-center justify-center space-y-6">
      <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-blue-500 bg-clip-text font-mono text-6xl font-extrabold tracking-tighter text-transparent">
        Next Zen Commerce
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <pre className="max-w-screen-lg text-wrap rounded-lg border bg-card p-8 text-muted-foreground">
          {JSON.stringify(stores, null, 2)}
        </pre>
        <pre className="max-w-screen-lg text-wrap rounded-lg border bg-card p-8 text-muted-foreground">
          {JSON.stringify(store, null, 2)}
        </pre>
      </div>
    </main>
  );
}
