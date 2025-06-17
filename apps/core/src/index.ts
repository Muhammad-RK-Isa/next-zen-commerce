import { merchantRouter } from "@nzc/api/merchant"
import { handlers as uploadHandlers } from "@nzc/storage"
import { OpenAPIGenerator } from "@orpc/openapi"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { RPCHandler } from "@orpc/server/fetch"
import { CORSPlugin } from "@orpc/server/plugins"
import { StrictGetMethodPlugin } from "@orpc/server/plugins"
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from "@orpc/zod"
import * as Bun from "bun"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "~/env"
import { userOauthCallbackRoutes } from "./auth/user-oauth-callback"

const app = new Hono()

app.use(logger())

app.use(cors())

app.all("/api/uploader", (c) => uploadHandlers(c.req.raw))

app.route("/api/user/auth/callback", userOauthCallbackRoutes)

const merchantRouteHandler = new RPCHandler(merchantRouter, {
  plugins: [new StrictGetMethodPlugin(), new CORSPlugin()],
})

app.use("/rpc/merchant/*", async (c, next) => {
  const { matched, response } = await merchantRouteHandler.handle(c.req.raw, {
    prefix: "/rpc/merchant",
    context: {
      req: c.req.raw,
      res: c.res,
    },
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

const merchantOpenAPIHandler = new OpenAPIHandler(merchantRouter, {
  plugins: [new ZodSmartCoercionPlugin(), new CORSPlugin()],
})

const merchantOpenAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

app.use("/api/merchant/*", async (c, next) => {
  const { matched, response } = await merchantOpenAPIHandler.handle(c.req.raw, {
    prefix: "/api/merchant",
    context: {
      req: c.req.raw,
      res: c.res,
    },
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

app.use("/swagger", async (c) => {
  const html = `
      <!doctype html>
      <html>
        <head>
          <title>My Client</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="/spec.json"
            data-configuration="${JSON.stringify({
              authentication: {
                preferredSecurityScheme: "bearerAuth",
                http: {
                  bearer: { token: "default-token" },
                },
              },
            }).replaceAll('"', "&quot;")}">
          </script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    `

  return c.html(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  })
})

app.use("/spec.json", async (c) => {
  const spec = await merchantOpenAPIGenerator.generate(merchantRouter, {
    info: {
      title: "Next Zen Commerce Playground",
      version: "1.0.0",
    },
    servers: [{ url: `${env.CORE_URL}/api/merchant` }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  })

  return c.text(JSON.stringify(spec))
})

app.get("*", serveStatic({ root: "./dist/static" }))
app.get("*", serveStatic({ path: "./dist/static/index.html" }))

const server = Bun.serve({
  fetch: app.fetch,
  port: 8000,
  development: process.env.NODE_ENV === "development",
  hostname: "0.0.0.0",
})

// biome-ignore  lint/suspicious/noConsole: This log is necessary for development purposes.
console.info(`⚡ Bun is running on ${server.url.host} 🚀🚀`)
