import { genUploader } from "uploadthing/client"

import type { UploadRouter } from "./core"

export const { uploadFiles } = genUploader<UploadRouter>({
  url: "/api/uploader",
  package: "@nzc/uploader",
})
