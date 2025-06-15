import { and, count, eq, isNull } from "@nzc/db"
import { members, stores } from "@nzc/db/schema"
import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"

export const hasStore = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/store/has-store",
    tags: ["Store"],
    summary: "Check if a merchant has stores",
    description: "This endpoint checks if a merchant has at least one store.",
  })
  .output(z.boolean())
  .handler(async ({ context }) => {
    const total = await context.db
      .select({
        count: count(),
      })
      .from(stores)
      .innerJoin(members, eq(members.storeId, stores.id))
      .where(and(eq(members.userId, context.user.id), isNull(stores.deletedAt)))
      .execute()
      .then((res) => res[0]?.count ?? 0)

    return !!total
  })
