import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";
import { appRouter } from "./root";
import { createAppContext } from "./trpc";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = AppRouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type AppRouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = AppRouterOutputs['post']['all']
 *      ^? Post[]
 **/
type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export { createAppContext, appRouter };
export type { AppRouter, AppRouterInputs, AppRouterOutputs };
