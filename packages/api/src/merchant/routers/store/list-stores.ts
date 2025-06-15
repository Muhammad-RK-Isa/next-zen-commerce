import { and, eq, isNull } from "@nzc/db"
import { files, members, stores } from "@nzc/db/schema"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"

export const listStores = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/store/list",
    tags: ["Store"],
    summary: "List stores",
  })
  .output(
    z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        logo: z
          .object({
            id: z.string(),
            name: z.string(),
            url: z.string(),
            alt: z.string().nullable(),
          })
          .nullable(),
        status: z.enum(["active", "inactive"]),
        createdAt: z.date(),
        updatedAt: z.date().nullable(),
        role: z.enum(["owner", "member"]),
      })
    )
  )
  .handler(async ({ context }) => {
    const rows = await context.db
      .select({
        id: stores.id,
        name: stores.name,
        logo: {
          id: files.id,
          name: files.name,
          alt: files.alt,
          url: files.url,
        },
        status: stores.status,
        createdAt: stores.createdAt,
        updatedAt: stores.updatedAt,
        role: members.role,
      })
      .from(stores)
      .innerJoin(members, eq(members.storeId, stores.id))
      .leftJoin(files, eq(files.id, stores.fileId))
      .where(and(eq(members.userId, context.user.id), isNull(stores.deletedAt)))

    return rows
  })
