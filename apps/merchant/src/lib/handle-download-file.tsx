import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { Button } from "@nzc/ui/components/button"
import { XIcon } from "lucide-react"
import { toast } from "sonner"
import { CircularProgressIcon } from "~/components/circular-progress-icon"

interface HandleDownloadProps {
  name: string
  url: string
  size: number
  progress: number
  setProgress: (progress: number) => void
}

export async function handleDownloadFile({
  name,
  url,
  size,
  progress,
  setProgress,
}: HandleDownloadProps) {
  const toastId = toast("Starting download...", {
    duration: Number.POSITIVE_INFINITY,
    dismissible: false,
    icon: <CircularProgressIcon progress={progress} />,
  })

  const [downloaded, error] = await tryCatch(async () => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const totalSize = size
    let loadedSize = 0
    const chunks: Uint8Array<ArrayBufferLike>[] = []
    const reader = response.body?.getReader()

    if (!reader) {
      throw new Error("Failed to get readable stream from response.")
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      chunks.push(value)
      loadedSize += value.length

      const newProgress = Math.round((loadedSize / totalSize) * 100)
      setProgress(newProgress)

      toast(`Downloading ${name}`, {
        id: toastId,
        duration: Number.POSITIVE_INFINITY,
        dismissible: false,
        icon: <CircularProgressIcon progress={newProgress} />,
      })
    }

    const fileData = new Uint8Array(loadedSize)
    let offset = 0
    for (const chunk of chunks) {
      fileData.set(chunk, offset)
      offset += chunk.length
    }

    const blob = new Blob([fileData], {
      type: response.headers.get("content-type") || undefined,
    })
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = blobUrl
    link.setAttribute("download", name)
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(link)
      setProgress(0)
    }, 0)

    return true
  })

  if (downloaded) {
    toast.success("File downloaded.", {
      id: toastId,
      dismissible: true,
      duration: 3000,
      icon: undefined,
      action: (
        <Button
          variant="outline"
          className="size-7 bg-inherit border-inherit hover:text-inherit hover:bg-inherit p-1 ml-auto"
          onClick={() => toast.dismiss(toastId)}
        >
          <XIcon />
        </Button>
      ),
    })
  }

  if (error) {
    toast.error("Download failed", { id: toastId, dismissible: true })
  }
}
