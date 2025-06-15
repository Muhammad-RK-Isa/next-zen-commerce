import type { FileEntity } from "@nzc/validators/common"

export function getFileType(rawType: File["type"]) {
  let fileType: FileEntity["type"]

  switch (true) {
    case rawType.startsWith("image"):
      fileType = "image"
      break
    case rawType.startsWith("video"):
      fileType = "video"
      break
    case rawType.startsWith("audio"):
      fileType = "audio"
      break
    case rawType === "application/pdf":
    case rawType === "text/plain":
    case rawType === "text/csv":
      fileType = "document"
      break
    default:
      fileType = "document"
  }
  return fileType
}

/**
 * Format bytes into human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
