import { redirect } from "next/navigation";

import { AuroraBackground } from "~/components/aurora-background";
import { api } from "~/trpc/server";

export default async function AuthLaout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await api.auth.session.query();

  if (session.user) {
    return redirect("/");
  }

  return <AuroraBackground>{children}</AuroraBackground>;
}
