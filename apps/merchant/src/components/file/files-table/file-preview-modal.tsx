import { zodResolver } from "@hookform/resolvers/zod"
import type { MerchantRouterOutputs } from "@nzc/api/merchant"
import { Button } from "@nzc/ui/components/button"
import { Card, CardContent, CardFooter } from "@nzc/ui/components/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nzc/ui/components/dialog"
import { AudioLines } from "@nzc/ui/components/icons/audio-lines"
import {
  MediaPlayer,
  MediaPlayerAudio,
  MediaPlayerControls,
  MediaPlayerDownload,
  MediaPlayerFullscreen,
  MediaPlayerLoop,
  MediaPlayerOverlay,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@nzc/ui/components/media-player"
import { Skeleton } from "@nzc/ui/components/skeleton"
import {
  type UpdateFileSchemaType,
  updateFileSchema,
} from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { formatDate } from "date-fns"
import {
  CornerDownLeftIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  FrownIcon,
  XIcon,
} from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Image } from "~/components/image"
import { handleDownloadFile } from "~/lib/handle-download-file"
import { formatBytes } from "~/lib/utils"
import { FileUpdateForm } from "./file-update-form"

interface FilePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
}

export function FilePreviewModal({
  open,
  onOpenChange,
  fileId,
}: FilePreviewModalProps) {
  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout/files",
  })
  const {
    data,
    isPending: isDataPending,
    error,
  } = useQuery(
    orpc.file.get.queryOptions({
      input: { id: fileId },
    })
  )

  const [progress, setProgress] = React.useState(0)
  const [isEditing, setIsEditing] = React.useState(false)

  const { mutate: update, isPending: isUpdating } = useMutation(
    orpc.file.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.file.get.key({
            input: { id: fileId },
          }),
        })
        await queryClient.invalidateQueries({
          queryKey: orpc.file.list.key(),
        })
        setIsEditing(false)
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message)
        } else {
          toast.error("Something went wrong.")
        }
      },
    })
  )

  const form = useForm<UpdateFileSchemaType>({
    resolver: zodResolver(updateFileSchema),
    disabled: isUpdating,
  })

  function handleSubmit(input: UpdateFileSchemaType) {
    if (isDataPending) {
      toast.info("File is not loaded yet.")
    }
    update(input)
  }
  if (error && !isDefinedError(error)) {
    toast.error("Something went wrong.")
  }

  React.useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [onOpenChange, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-screen h-screen rounded-none p-0 sm:p-0 px-4 sm:px-6">
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            icon={<XIcon className="size-6" />}
            className="top-4 absolute right-4"
          />
        </DialogClose>
        <DialogHeader className="hidden">
          <DialogTitle className="sr-only">{data?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-3 h-screen gap-8 place-content-center lg:place-content-around max-w-7xl mx-auto w-full">
          <div className="lg:col-span-2 h-full flex flex-col">
            <div className="my-auto">
              {isDataPending ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : isDefinedError(error) && error.code === "NOT_FOUND" ? (
                <div className="w-full h-full flex items-center justify-center text-center space-y-4">
                  <FrownIcon className="size-12" />
                  File not found.
                </div>
              ) : (
                <PreviewComponent
                  // biome-ignore  lint/style/noNonNullAssertion: data is guaranteed to be defined
                  file={data!}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <Card className="my-auto relative">
              <CardContent className="space-y-4">
                {isEditing ? (
                  <FileUpdateForm
                    form={form}
                    isLoading={isDataPending}
                    onSubmit={handleSubmit}
                    fileName={data?.name ?? ""}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Button
                        disabled={isUpdating}
                        type="button"
                        variant="outline"
                        className="grow"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        loading={isUpdating}
                        className="grow"
                        icon={<CornerDownLeftIcon />}
                        iconPosition="right"
                      >
                        {isUpdating ? "Updating" : "Save changes"}
                      </Button>
                    </div>
                  </FileUpdateForm>
                ) : (
                  <>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">File name</p>
                      <p className="text-muted-foreground text-wrap break-words">
                        {data?.name}
                      </p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">Alt text</p>
                      <p className="text-muted-foreground text-wrap break-words">
                        {data?.alt ?? "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">Description</p>
                      <p className="text-muted-foreground text-wrap break-words">
                        {data?.description ?? "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">Details</p>
                      <p className="text-muted-foreground">
                        {formatBytes(data?.size ?? 0)} • {data?.mimeType}
                      </p>
                      {data?.createdAt ? (
                        <p className="text-muted-foreground">
                          Added {formatDate(data?.createdAt, "MMMM d, yyyy")}
                        </p>
                      ) : null}
                      {data?.updatedAt ? (
                        <p className="text-muted-foreground">
                          Updated {formatDate(data?.updatedAt, "MMMM d, yyyy")}
                        </p>
                      ) : null}
                    </div>
                  </>
                )}
              </CardContent>
              {isEditing ? null : (
                <CardFooter className="space-x-4">
                  <Button
                    variant="outline"
                    icon={<DownloadIcon />}
                    disabled={isDataPending || isUpdating}
                    className="grow"
                    onClick={async () =>
                      data &&
                      (await handleDownloadFile({
                        ...data,
                        progress,
                        setProgress,
                      }))
                    }
                  >
                    Download
                  </Button>
                  <Button
                    disabled={isDataPending || isUpdating}
                    icon={<EditIcon />}
                    className="grow"
                    onClick={() => {
                      if (data) {
                        Object.keys(data).map((item) =>
                          form.setValue(
                            item as keyof UpdateFileSchemaType,
                            data[item as keyof UpdateFileSchemaType]
                          )
                        )
                        form.setValue(
                          "name",
                          data.name.split(".").slice(0, -1).join(".")
                        )
                      } else {
                        toast.info("File has not been loaded yet.")
                        return
                      }
                      setIsEditing(true)
                    }}
                  >
                    Edit
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PreviewComponent({
  file,
}: {
  file: MerchantRouterOutputs["file"]["get"]
}) {
  const [isPlaying, setIsPlaying] = React.useState(false)

  switch (file.type) {
    case "image":
      return (
        <Image
          src={file.url}
          alt={file.alt ?? file.name}
          height={1080}
          aspectRatio={1 / 1}
          layout="constrained"
          className="my-auto rounded-lg border"
        />
      )
    case "video":
      return (
        <MediaPlayer className="border">
          <MediaPlayerVideo>
            <source src={file.url} type="video/mp4" />
          </MediaPlayerVideo>
          <MediaPlayerControls className="flex-col items-start gap-2.5">
            <MediaPlayerOverlay />
            <MediaPlayerSeek />
            <div className="flex w-full items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <MediaPlayerPlay />
                <MediaPlayerSeekBackward />
                <MediaPlayerSeekForward />
                <MediaPlayerVolume expandable />
                <MediaPlayerTime />
              </div>
              <div className="flex items-center gap-2">
                <MediaPlayerDownload />
                <MediaPlayerPlaybackSpeed />
                <MediaPlayerPiP />
                <MediaPlayerFullscreen />
              </div>
            </div>
          </MediaPlayerControls>
        </MediaPlayer>
      )
    case "audio":
      return (
        <MediaPlayer
          className="h-96"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <div className="flex items-center justify-center bg-muted/20 border rounded-lg h-full">
            <AudioLines
              className="size-20 text-muted-foreground mb-16"
              animate={isPlaying}
            />
          </div>
          <MediaPlayerAudio>
            <source src={file.url} type="audio/mp3" />
          </MediaPlayerAudio>
          <MediaPlayerControls className="flex-col items-start gap-2.5 p-10">
            <MediaPlayerSeek withTime />
            <div className="flex w-full items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <MediaPlayerPlay />
                <MediaPlayerSeekBackward />
                <MediaPlayerSeekForward />
                <MediaPlayerVolume expandable />
                <MediaPlayerTime />
              </div>
              <div className="flex items-center gap-2">
                <MediaPlayerPlaybackSpeed />
                <MediaPlayerLoop mode="repeat" />
              </div>
            </div>
          </MediaPlayerControls>
        </MediaPlayer>
      )
    case "document":
    default:
      return (
        <div
          className="h-96 grid place-content-center w-full border bg-muted/20 rounded-lg"
          title={file.mimeType}
        >
          <FileTextIcon className="size-20 text-muted-foreground" />
        </div>
      )
  }
}
