import { redirect } from "next/navigation";

interface StoreHandlePageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function StoreHandlePage({
  params,
}: StoreHandlePageProps) {
  const { handle } = await params;

  return redirect(`/store/${handle}/dashboard`);
}
