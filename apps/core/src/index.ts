import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { appRouter, createAppContext } from "@nzc/api/app";
import { env } from "@nzc/env";

const app = new Hono();

app.use(cors());

app.use("*", logger());

app.use(
  "/api/app/*",
  trpcServer({
    router: appRouter,
    createContext: createAppContext,
    endpoint: "/api/app",
  }),
);

Bun.serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port: env.BACKEND_PORT,
  idleTimeout: 255,
});

console.log(
  `⚡️ Hono server is running at http://localhost:${env.BACKEND_PORT} 🚀`,
);
