import { authRouter } from "./routers/auth";
import { fileRouter } from "./routers/file";
import { storeRouter } from "./routers/store";
import { createAppRouter } from "./trpc";

export const appRouter = createAppRouter({
  auth: authRouter,
  store: storeRouter,
  file: fileRouter,
});

export type AppRouter = typeof appRouter;
