import type { FileRouter } from "uploadthing/server";
import { createUploadthing, UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { validateUserRequest } from "@nzc/auth/validate-user-request";
import { and, eq, isNull } from "@nzc/db";
import { db } from "@nzc/db/client";
import { files, stores, usersStores } from "@nzc/db/schema";
import { env } from "@nzc/env";

import { getFileType } from "./utils";

const f = createUploadthing();

const uploadFileInputSchema = z.object({
  storeId: z.string(),
});

export const uploadRouter = {
  appUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
    video: {
      maxFileCount: 10,
      maxFileSize: "64MB",
    },
    text: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
    "application/zip": {
      maxFileSize: "64MB",
      maxFileCount: 10,
    },
  })
    .input(uploadFileInputSchema)
    .middleware(async ({ req, input }) => {
      const { user } = await validateUserRequest({ req });

      if (!user) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "You are not authorized to perform this action",
        });
      }

      const [store] = await db
        .select({
          id: stores.id,
          name: stores.name,
          handle: stores.handle,
          status: stores.status,
          role: usersStores.role,
        })
        .from(stores)
        .innerJoin(
          usersStores,
          and(
            eq(usersStores.storeId, stores.id),
            eq(usersStores.userId, user.id),
          ),
        )
        .where(and(eq(stores.id, input.storeId), isNull(stores.deletedAt)))
        .limit(1);

      if (!store)
        throw new UploadThingError({
          code: "NOT_FOUND",
          message: "Invalid store id.",
        });

      if (store.status === "inactive")
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Store is not active.",
        });

      if (!(["owner", "manager"] as (typeof store.role)[]).includes(store.role))
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "You are not authorized to perform this action.",
        });

      return { store, user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileType = getFileType(file.type);

      await db
        .insert(files)
        .values({
          id: file.key,
          type: fileType,
          name: file.name,
          url: file.url,
          size: file.size,
          storeId: metadata.store.id,
        })
        .execute();

      if (env.NODE_ENV !== "production") {
        console.log("✅ Upload completed");
        console.log(
          `✅ Upload completed by [${metadata.user.id} : ${metadata.user.email}]`,
        );
        console.log("🔗 File url", file.url);
      }
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
