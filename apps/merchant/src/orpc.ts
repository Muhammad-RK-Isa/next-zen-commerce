import type { merchantRouter } from "@nzc/api/merchant"
import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins"
import type { RouterClient } from "@orpc/server"

const link = new RPCLink({
  url: new URL("/rpc/merchant", import.meta.env.VITE_MERCHANT_URL),
  plugins: [new SimpleCsrfProtectionLinkPlugin()],
})

export const orpcClient: RouterClient<typeof merchantRouter> =
  createORPCClient(link)
