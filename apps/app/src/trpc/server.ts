import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import SuperJSON from "superjson";

import type { AppRouter } from "@nzc/api/app";

import { env } from "~/env";
import { createQueryClient } from "./query-client";

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.BACKEND_URL}/api/app`,
      transformer: SuperJSON,
      headers: async () => {
        const heads = new Headers(await headers());
        heads.set("x-trpc-source", "nextjs-react");
        return Object.fromEntries(heads.entries());
      },
    }),
  ],
});

export const trpcServerUtils = createServerSideHelpers({
  client: api,
  queryClient: cache(createQueryClient)(),
});
