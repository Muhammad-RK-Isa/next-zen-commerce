import { resolve } from "node:path"
import Tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import ViteReact from "@vitejs/plugin-react"
import Unfont from "unplugin-fonts/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    ViteReact(),
    Tailwindcss(),
    Unfont({
      google: {
        families: ["Geist", "Geist Mono"],
        display: "swap",
        preconnect: true,
      },
    }),
  ],
  build: {
    outDir: "../core/dist/static",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/rpc": {
        target: process.env.VITE_CORE_URL,
        changeOrigin: true,
      },
      "/api": {
        target: process.env.VITE_CORE_URL,
        changeOrigin: true,
      },
    },
  },
})
