import type { FC, PropsWithChildren } from "hono/jsx"
import { env } from "~/env"

const Layout: FC = (props: PropsWithChildren) => {
  return (
    <html lang="en">
      <head>
        <title>Authentication Failed</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/@tailwindcss/browser@4" />
      </head>
      <body class="min-h-screen bg-black text-white grid place-content-center">
        {props.children}
      </body>
    </html>
  )
}

export const RestartProcess: FC<{ redirectUrl?: string }> = ({
  redirectUrl,
}) => {
  return (
    <Layout>
      <div class="flex flex-col items-center space-y-6 p-8">
        <h1 class="text-4xl font-bold text-white">Authentication Failed</h1>
        <p class="text-zinc-400 text-lg">
          Please restart the authentication process.
        </p>
        <a href={redirectUrl ?? env.MERCHANT_URL}>
          <button
            type="button"
            class="px-6 py-3 bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Restart Process
          </button>
        </a>
      </div>
    </Layout>
  )
}
