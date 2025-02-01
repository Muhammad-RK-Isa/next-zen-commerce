import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card";

import { trpcServerUtils } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user } = await trpcServerUtils.auth.session.fetch();
  return (
    <div className="grid h-screen place-content-center">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-w-screen-lg text-wrap rounded-lg border p-4 text-muted-foreground">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
