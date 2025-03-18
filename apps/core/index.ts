import { serve } from "bun"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "~/env"

const app = new Hono()

app.use(cors())

app.use("*", logger())

app.use("/", async (c) => {
  return c.text(`⚡️ Hono server is running at ${env.CORE_URL} 🚀`)
})

app.use("/health", async (c) => {
  return c.json({ status: "ok" })
})

const server = serve({
  fetch: app.fetch,
  port: env.CORE_PORT,
  hostname: "0.0.0.0",
  development: env.NODE_ENV === "development",
})

// biome-ignore lint/suspicious/noConsoleLog: This is a necessary log
// biome-ignore lint/suspicious/noConsole: This is a necessary log
console.log(`🚀 Server running at ${server.url}`)
