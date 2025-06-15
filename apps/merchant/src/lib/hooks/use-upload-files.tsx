import * as React from "react"
import { toast } from "sonner"
import { UploadThingError } from "uploadthing/server"
import type { AnyFileRoute, UploadFilesOptions } from "uploadthing/types"

import type { FileDTO } from "@nzc/validators/common"

import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { uploadFiles } from "@nzc/storage/client"
import type { UploadRouter } from "@nzc/storage/core"
import { getFileType } from "@nzc/storage/utils"
import { Button } from "@nzc/ui/components/button"
import { useRouteContext } from "@tanstack/react-router"
import { XIcon } from "lucide-react"
import { CircularProgressIcon } from "~/components/circular-progress-icon"

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<AnyFileRoute>,
    "headers" | "onUploadBegin" | "onUploadProgress" | "skipPolling"
  > {
  defaultUploadedFiles?: FileDTO[]
  storeId: string
}

export function useUploadFile(
  endpoint: keyof UploadRouter,
  { defaultUploadedFiles = [], storeId, ...props }: UseUploadFileProps
) {
  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })
  const [uploadedFiles, setUploadedFiles] =
    React.useState<FileDTO[]>(defaultUploadedFiles)
  const [isUploading, setIsUploading] = React.useState(false)

  async function uploadThings(files: File[]) {
    setIsUploading(true)

    const toastIds: Record<string, string | number> = {}

    files.forEach((file) => {
      const id = toast(`Uploading ${file.name}`, {
        duration: Number.POSITIVE_INFINITY,
        dismissible: false,
        icon: <CircularProgressIcon progress={0} />,
      })
      toastIds[file.name] = id
    })

    const [_, error] = await tryCatch(async () => {
      const res = await uploadFiles(endpoint, {
        ...props,
        input: { storeId },
        files,
        onUploadProgress: ({ file, progress }) => {
          const toastId = toastIds[file.name]
          if (!toastId) {
            return
          }
          toast(`Uploading ${file.name}`, {
            duration: Number.POSITIVE_INFINITY,
            dismissible: false,
            id: toastId,
            icon: <CircularProgressIcon progress={progress} />,
          })
        },
      })
      const formattedRes: FileDTO[] = res.map((file) => {
        const fileType = getFileType(file.type)
        return {
          id: file.key,
          name: file.name,
          url: file.ufsUrl,
          type: fileType,
        }
      })
      setUploadedFiles((prev) => [...prev, ...formattedRes])
      for (const name of Object.keys(toastIds)) {
        const id = toast.success(`File ${name} uploaded successfully.`, {
          id: toastIds[name],
          dismissible: true,
          duration: 3000,
          icon: undefined,
          action: (
            <Button
              variant="outline"
              className="size-7 bg-inherit border-inherit hover:text-inherit hover:bg-inherit p-1 ml-auto"
              onClick={() => toast.dismiss(id)}
            >
              <XIcon />
            </Button>
          ),
        })
      }
    })

    if (error) {
      toast.dismiss()
      toast.error(
        error instanceof UploadThingError ? error.message : "Upload failed"
      )
    }

    setIsUploading(false)
    await queryClient.refetchQueries({
      queryKey: orpc.file.list.key(),
    })
  }

  return {
    uploadedFiles,
    uploadFiles: uploadThings,
    isUploading,
    setUploadedFiles,
  }
}
