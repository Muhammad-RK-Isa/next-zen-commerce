import { createFileRoute } from "@tanstack/react-router"
import { FilesTable } from "~/components/file/files-table/files-table"

export const Route = createFileRoute(
  "/_authorized-layout/_dashboard-layout/files"
)({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Files",
      },
      {
        name: "description",
        content: "Manage your files",
      },
    ],
  }),
  pendingComponent: () => <div>Loading...</div>,
})

function RouteComponent() {
  return (
    <main>
      <FilesTable />
    </main>
  )
}
