import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server"
import type { merchantRouter } from "./root"

export { merchantRouter } from "./root"

export type MerchantRouter = typeof merchantRouter

export type MerchantRouterInputs = InferRouterInputs<typeof merchantRouter>
export type MerchantRouterOutputs = InferRouterOutputs<typeof merchantRouter>
