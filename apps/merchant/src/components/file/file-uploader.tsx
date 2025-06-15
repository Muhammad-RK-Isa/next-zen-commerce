"use client"

import * as React from "react"
import type { Accept, FileRejection } from "react-dropzone"
import Dropzone from "react-dropzone"
import { toast } from "sonner"

import { cn } from "@nzc/ui/lib/utils"
import type { FileType } from "@nzc/validators/common"
import { HandHelpingIcon, Upload } from "lucide-react"
import { useControllableState } from "~/lib/hooks/use-controllable-state"
import { formatBytes } from "~/lib/utils"

const FILE_SIZE_REGEX = /(\d+) bytes/

const DEFAULT_ACCEPT: Accept = {
  "image/*": [],
  "video/*": [],
  "audio/*": [],
  "text/plain": [],
  "text/csv": [],
  "application/pdf": [],
  "application/zip": [],
}

// Map FileType to Dropzone's Accept format
const mapFileTypesToAccept = (fileTypes: FileType[]): Accept => {
  if (!fileTypes || fileTypes.length === 0) {
    return DEFAULT_ACCEPT
  }

  const accept: Accept = {}

  fileTypes.forEach((type) => {
    switch (type) {
      case "video":
        accept["video/*"] = []
        break
      case "audio":
        accept["audio/*"] = []
        break
      case "document": {
        accept["text/plain"] = []
        accept["text/csv"] = []
        accept["application/pdf"] = []
        accept["application/zip"] = []
        break
      }
      case "image":
      default:
        accept["image/*"] = []
        break
    }
  })

  return accept
}

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[]

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>

  /**
   * Accepted file types for the uploader.
   * @type FileType[]
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image", "video"]}
   */
  accept?: FileType[]

  /**
   * Maximum file size for the uploader.
   * @type FileSizeLimits
   * @default { image: 1024 * 1024 * 2, video: 1024 * 1024 * 10, audio: 1024 * 1024 * 5 }
   * @example maxFileSizes={{ image: 1024 * 1024 * 2, video: 1024 * 1024 * 10, audio: 1024 * 1024 * 5 }}
   */
  maxFileSizes: Record<"image" | "video" | "audio" | "document", number>

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFiles={5}
   */
  maxFiles?: number

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean

  /**
   * Whether the files are being uploaded or not
   * @type boolean
   * @example isUploading
   */
  isUploading?: boolean
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    accept = ["image", "video", "audio", "document"],
    maxFileSizes = {
      image: 1024 * 1024 * 4,
      video: 1024 * 1024 * 16,
      audio: 1024 * 1024 * 4,
      document: 1024 * 1024 * 16,
    },
    maxFiles = 1,
    multiple = false,
    disabled = false,
    isUploading = false,
    className,
    ...dropzoneProps
  } = props

  const dropzoneAccept = React.useMemo(
    () => mapFileTypesToAccept(accept),
    [accept]
  )

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  })

  const getFileCategory = (fileType: string): FileType => {
    if (fileType.startsWith("image/")) {
      return "image"
    }
    if (fileType.startsWith("video/")) {
      return "video"
    }
    if (fileType.startsWith("audio/")) {
      return "audio"
    }
    return "document"
  }

  const validateFileSize = React.useCallback(
    (file: File): { valid: boolean; message?: string } => {
      const fileCategory = getFileCategory(file.type)
      const maxSize = maxFileSizes[fileCategory]

      return {
        valid: file.size <= maxSize,
        message:
          file.size > maxSize
            ? `${fileCategory.charAt(0).toUpperCase() + fileCategory.slice(1)} file exceeds maximum size of ${formatBytes(maxSize)}`
            : undefined,
      }
    },
    [maxFileSizes]
  )

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time")
        return
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`)
        return
      }

      const invalidFiles: { file: File; message: string }[] = []
      const validFiles = acceptedFiles.filter((file) => {
        const validation = validateFileSize(file)
        if (!validation.valid && validation.message) {
          invalidFiles.push({ file, message: validation.message })
          return false
        }
        return true
      })

      invalidFiles.forEach(({ file, message }) => {
        toast.error(
          <div className="font-medium">
            <span>{`File ${file.name} was rejected:`}</span>
            <ul className="list-disc space-y-1 p-2 text-[0.8rem]">
              <li className="ml-4">{message}</li>
            </ul>
          </div>
        )
      })

      const newFiles = validFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )

      const updatedFiles = files ? [...files, ...newFiles] : newFiles

      setFiles(updatedFiles)

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          toast.error(
            <div className="font-medium">
              <span>{`File ${file.name} was rejected due to the following errors:`}</span>
              <ul className="list-disc space-y-1 p-2 text-[0.8rem]">
                {errors.map((error) => (
                  <li key={error.code} className="ml-4">
                    {error.code === "file-too-large"
                      ? error.message.replace(FILE_SIZE_REGEX, (_, bytes) =>
                          formatBytes(bytes)
                        )
                      : error.message}
                  </li>
                ))}
              </ul>
            </div>
          )
        })
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFiles
      ) {
        await Promise.all(updatedFiles.map((file) => onUpload([file])))
        setFiles([])
      }
    },
    [files, maxFiles, multiple, onUpload, setFiles, validateFileSize]
  )

  React.useEffect(() => {
    return () => {
      if (!files) {
        return
      }
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles

  const getMaxSizesDisplay = () => {
    return Object.entries(maxFileSizes)
      .map(([category, size]) => `${category}s: ${formatBytes(size)}`)
      .join(", ")
  }

  const largestMaxSize = Math.max(...Object.values(maxFileSizes))

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={dropzoneAccept}
        maxSize={largestMaxSize}
        maxFiles={maxFiles}
        multiple={maxFiles > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm sm:text-base p-4 sm:p-6 text-center transition-all hover:bg-muted/25",
              "focus-visible:border-primary focus-visible:outline-none",
              isDragActive && "border-muted-foreground",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <HandHelpingIcon
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-medium text-muted-foreground">
                  Drop it, I will catch it!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-px">
                  <p className="font-medium text-muted-foreground">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                    {maxFiles > 1
                      ? ` ${maxFiles === Number.POSITIVE_INFINITY ? "multiple" : maxFiles}
                                        files (${getMaxSizesDisplay()})`
                      : ` a file (${getMaxSizesDisplay()})`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  )
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string"
}
