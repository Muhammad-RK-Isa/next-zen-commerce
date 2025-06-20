import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import "@nzc/ui/styles/globals.css"

import { scan } from "react-scan"
import reportWebVitals from "./report-web-vitals.ts"
import { router } from "./router.tsx"

scan({
  enabled: false,
})

const rootElement = document.getElementById("__nzc")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log)
