import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { and, asc, count, desc, eq, gte, ilike, inArray, lte } from "@nzc/db"
import { files } from "@nzc/db/schema"
import { listFilesInputSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { filterColumns } from "~/utils"

const listFilesOutputSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      name: z.string(),
      type: z.enum(["image", "video", "audio", "document"]),
      mimeType: z.string(),
      size: z.number(),
      createdAt: z.date(),
    })
  ),
  pageCount: z.number(),
})

export const listFiles = merchActiveStoreProcedure
  .route({
    method: "GET",
    path: "/file/list",
    tags: ["File"],
    summary: "List files",
  })
  .input(listFilesInputSchema)
  .output(listFilesOutputSchema)
  .handler(async ({ context, input }) => {
    const storeId = context.session.activeStoreId
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId,
      requiredPermissions: [{ file: ["read"] }],
    })

    if (!isPermitted) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You are not authorized to access this resource.",
      })
    }

    const offset = (input.page - 1) * input.perPage
    const limit = input.perPage ?? 10

    const advancedWhere = and(
      filterColumns({
        table: files,
        filters: input.filters,
        joinOperator: input.joinOperator,
      }),
      eq(files.storeId, storeId)
    )

    const where = input.advancedTable
      ? advancedWhere
      : and(
          eq(files.storeId, storeId),
          input.name ? ilike(files.name, `%${input.name}%`) : undefined,
          input.type.length > 0 ? inArray(files.type, input.type) : undefined,
          input.createdAt.length > 0
            ? and(
                input.createdAt[0]
                  ? gte(
                      files.createdAt,
                      (() => {
                        const date = new Date(input.createdAt[0])
                        date.setHours(0, 0, 0, 0)
                        return date
                      })()
                    )
                  : undefined,
                input.createdAt[1]
                  ? lte(
                      files.createdAt,
                      (() => {
                        const date = new Date(input.createdAt[1])
                        date.setHours(23, 59, 59, 999)
                        return date
                      })()
                    )
                  : undefined
              )
            : undefined
        )

    const orderBy =
      input.sort.length > 0
        ? input.sort.map((item) =>
            item.desc ? desc(files[item.id]) : asc(files[item.id])
          )
        : [asc(files.createdAt)]

    const [result, error] = await tryCatch(async () => {
      return await context.db.transaction(async (tx) => {
        const data = await tx
          .select({
            id: files.id,
            url: files.url,
            name: files.name,
            type: files.type,
            mimeType: files.mimeType,
            size: files.size,
            createdAt: files.createdAt,
          })
          .from(files)
          .limit(limit)
          .offset(offset)
          .where(where)
          .orderBy(...orderBy)
          .groupBy(files.id)

        const total = await tx
          .select({
            count: count(),
          })
          .from(files)
          .where(where)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        return {
          data,
          total,
        }
      })
    })

    if (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      return { data: [], pageCount: 0 }
    }

    const pageCount = Math.ceil(result.total / input.perPage)
    return { data: result.data, pageCount }
  })
