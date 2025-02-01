import type { FileEntity } from "@nzc/validators/common";

export function getFileType(rawType: File["type"]) {
  let fileType: FileEntity["type"];

  switch (true) {
    case rawType.startsWith("image"):
      fileType = "image";
      break;
    case rawType.startsWith("video"):
      fileType = "video";
      break;
    case rawType.startsWith("audio"):
      fileType = "audio";
      break;
    case rawType === "application/pdf":
    case rawType === "text/plain":
    case rawType === "text/csv":
      fileType = "document";
      break;
    default:
      fileType = "document";
  }
  return fileType;
}
