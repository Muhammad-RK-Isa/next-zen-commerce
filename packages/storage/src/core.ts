import type { FileRouterInputConfig } from "@uploadthing/shared"
import type { FileRouter } from "uploadthing/server"
import { UploadThingError, createUploadthing } from "uploadthing/server"
import { z } from "zod"

import { validateRequest } from "@nzc/auth/user/validate-request"
import { and, eq, isNull } from "@nzc/db"
import { db } from "@nzc/db/client"
import { files, members, stores } from "@nzc/db/schema"

import { getFileType } from "./utils"

const f = createUploadthing()

const uploadFileInputSchema = z.object({
  storeId: z.string(),
})

export const fileConfig: FileRouterInputConfig = {
  "image/jpeg": {
    maxFileSize: "4MB",
    maxFileCount: 10,
  },
  "image/png": {
    maxFileSize: "4MB",
    maxFileCount: 10,
  },
  "image/webp": {
    maxFileSize: "4MB",
    maxFileCount: 10,
  },
  "image/gif": {
    maxFileSize: "4MB",
    maxFileCount: 10,
  },
  "audio/mpeg": {
    maxFileSize: "16MB",
    maxFileCount: 10,
  },
  "audio/mp4": {
    maxFileSize: "16MB",
    maxFileCount: 10,
  },
  "video/mp4": {
    maxFileCount: 10,
    maxFileSize: "16MB",
  },
  "video/webm": {
    maxFileCount: 10,
    maxFileSize: "16MB",
  },
  "video/h264": {
    maxFileCount: 10,
    maxFileSize: "16MB",
  },
  "application/zip": {
    maxFileSize: "16MB",
    maxFileCount: 10,
  },
  "application/pdf": {
    maxFileSize: "16MB",
    maxFileCount: 10,
  },
}

export const uploadRouter = {
  merchantUploader: f(fileConfig)
    .input(uploadFileInputSchema)
    .middleware(async ({ req, input }) => {
      const { user } = await validateRequest(req)

      if (!user) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "You must be authenticated to upload files.",
        })
      }

      const [store] = await db
        .select({
          id: stores.id,
          name: stores.name,
          status: stores.status,
          role: members.role,
          permissions: members.permissions,
        })
        .from(stores)
        .innerJoin(
          members,
          and(eq(members.storeId, stores.id), eq(members.userId, user.id))
        )
        .where(and(eq(stores.id, input.storeId), isNull(stores.deletedAt)))
        .limit(1)

      if (!store) {
        throw new UploadThingError({
          code: "NOT_FOUND",
          message: "Invalid store id.",
        })
      }

      if (store.status === "inactive") {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Store is not active.",
        })
      }

      if (store.role !== "owner" && !store.permissions.file.includes("write")) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
        })
      }

      return { store, user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileType = getFileType(file.type)

      await db
        .insert(files)
        .values({
          id: file.key,
          type: fileType,
          mimeType: file.type,
          name: file.name,
          url: file.ufsUrl,
          size: file.size,
          storeId: metadata.store.id,
        })
        .execute()

      return { uploadedBy: metadata.user.id }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
