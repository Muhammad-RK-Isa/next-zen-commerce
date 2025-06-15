"use client"

import { Button } from "@nzc/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nzc/ui/components/dialog"
import { useQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { UploadCloudIcon } from "lucide-react"
import React from "react"
import { FileUploader } from "~/components/file/file-uploader"
import { useUploadFile } from "~/lib/hooks/use-upload-files"

export function FileUploadModal() {
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false)

  const { orpc } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })

  const { data: store } = useQuery(orpc.store.getActive.queryOptions())

  const { uploadFiles, isUploading } = useUploadFile("merchantUploader", {
    defaultUploadedFiles: [],
    storeId: store?.id ?? "",
  })

  const maxFileSizes = {
    image: 1024 * 1024 * 4,
    video: 1024 * 1024 * 16,
    audio: 1024 * 1024 * 16,
    document: 1024 * 1024 * 16,
  }

  const maxFiles = 10

  return (
    <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
      <DialogTrigger asChild>
        <Button
          icon={<UploadCloudIcon />}
          size="sm"
          onClick={() => setUploadModalOpen(true)}
        >
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-sm w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to use in your store.
          </DialogDescription>
        </DialogHeader>
        <FileUploader
          maxFiles={maxFiles}
          maxFileSizes={maxFileSizes}
          disabled={isUploading}
          onUpload={async (files) => {
            setUploadModalOpen(false)
            await uploadFiles(files)
          }}
          isUploading={isUploading}
          multiple={true}
          className="h-72 w-full"
        />
      </DialogContent>
    </Dialog>
  )
}
