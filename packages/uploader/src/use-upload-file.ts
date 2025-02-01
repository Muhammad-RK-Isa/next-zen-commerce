import type { AnyFileRoute, UploadFilesOptions } from "uploadthing/types";
import * as React from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

import type { MinimalFile } from "@nzc/validators/common";

import type { UploadRouter } from "./core";
import { uploadFiles } from "./client";
import { getFileType } from "./utils";

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<AnyFileRoute>,
    "headers" | "onUploadBegin" | "onUploadProgress" | "skipPolling"
  > {
  defaultUploadedFiles?: MinimalFile[];
  storeId: string;
}

export function useUploadFile(
  endpoint: keyof UploadRouter,
  { defaultUploadedFiles = [], storeId, ...props }: UseUploadFileProps,
) {
  const [uploadedFiles, setUploadedFiles] =
    React.useState<MinimalFile[]>(defaultUploadedFiles);
  const [progresses, setProgresses] = React.useState<Record<string, number>>(
    {},
  );
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadThings(files: File[]) {
    setIsUploading(true);
    try {
      const res = await uploadFiles(endpoint, {
        ...props,
        input: { storeId },
        files,
        onUploadProgress: ({ file, progress }) => {
          setProgresses((prev) => {
            return {
              ...prev,
              [file.name]: progress,
            };
          });
        },
      });

      const formattedRes: MinimalFile[] = res.map((file) => {
        const fileType = getFileType(file.type);
        return {
          id: file.key,
          name: file.name,
          url: file.url,
          type: fileType,
        };
      });

      setUploadedFiles((prev) => [...prev, ...formattedRes]);
    } catch (err) {
      toast.error(
        err instanceof UploadThingError ? err.message : "Upload failed",
      );
    } finally {
      setProgresses({});
      setIsUploading(false);
    }
  }

  return {
    uploadedFiles,
    progresses,
    uploadFiles: uploadThings,
    isUploading,
    setUploadedFiles,
  };
}
