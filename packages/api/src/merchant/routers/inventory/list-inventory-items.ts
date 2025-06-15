import { tryCatch } from "@maxmorozoff/try-catch-tuple"
import { and, asc, count, desc, eq, gte, ilike, isNull, lte } from "@nzc/db"
import { files, inventoryItems } from "@nzc/db/schema"
import { baseFileSchema, baseInventoryItemSchema } from "@nzc/validators/common"
import { listInventoryItemsInputSchema } from "@nzc/validators/merchant"
import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { merchActiveStoreProcedure } from "~/merchant/orpc"
import { validatePermission } from "~/merchant/validate-permission"
import { filterColumns } from "~/utils"

const outputSchema = z.object({
  data: z.array(
    baseInventoryItemSchema
      .pick({
        id: true,
        name: true,
        quantity: true,
        sku: true,
        createdAt: true,
      })
      .extend({
        image: baseFileSchema
          .pick({
            id: true,
            url: true,
            name: true,
            type: true,
          })
          .nullish(),
      })
  ),
  pageCount: z.number(),
})

export const listInventoryItems = merchActiveStoreProcedure
  .route({
    method: "GET",
    path: "/inventory/list",
    tags: ["Inventory"],
    summary: "List inventory items",
  })
  .input(listInventoryItemsInputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const storeId = context.session.activeStoreId
    const { isPermitted } = await validatePermission({
      userId: context.user.id,
      storeId,
      requiredPermissions: [{ inventory: ["read"] }],
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
        table: inventoryItems,
        filters: input.filters,
        joinOperator: input.joinOperator,
      }),
      eq(inventoryItems.storeId, storeId),
      isNull(inventoryItems.deletedAt)
    )

    const where = input.advancedTable
      ? advancedWhere
      : and(
          eq(inventoryItems.storeId, storeId),
          isNull(inventoryItems.deletedAt),
          input.name
            ? ilike(inventoryItems.name, `%${input.name}%`)
            : undefined,
          input.sku ? ilike(inventoryItems.sku, `%${input.sku}%`) : undefined,
          input.quantity.length > 0
            ? and(
                input.quantity[0]
                  ? gte(inventoryItems.quantity, input.quantity[0])
                  : undefined,
                input.quantity[1]
                  ? lte(inventoryItems.quantity, input.quantity[1])
                  : undefined
              )
            : undefined,
          input.createdAt.length > 0
            ? and(
                input.createdAt[0]
                  ? gte(
                      inventoryItems.createdAt,
                      (() => {
                        const date = new Date(input.createdAt[0])
                        date.setHours(0, 0, 0, 0)
                        return date
                      })()
                    )
                  : undefined,
                input.createdAt[1]
                  ? lte(
                      inventoryItems.createdAt,
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
            item.desc
              ? desc(inventoryItems[item.id])
              : asc(inventoryItems[item.id])
          )
        : [asc(inventoryItems.createdAt)]

    const [result, error] = await tryCatch(async () => {
      return await context.db.transaction(async (tx) => {
        const data = await tx
          .select({
            id: inventoryItems.id,
            name: inventoryItems.name,
            quantity: inventoryItems.quantity,
            sku: inventoryItems.sku,
            image: {
              id: files.id,
              name: files.name,
              alt: files.alt,
              url: files.url,
              type: files.type,
            },
            createdAt: inventoryItems.createdAt,
          })
          .from(inventoryItems)
          .leftJoin(files, eq(inventoryItems.fileId, files.id))
          .limit(limit)
          .offset(offset)
          .where(where)
          .orderBy(...orderBy)
          .groupBy(inventoryItems.id, files.id)

        const total = await tx
          .select({
            count: count(),
          })
          .from(inventoryItems)
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
