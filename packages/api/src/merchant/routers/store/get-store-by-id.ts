import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"

export const getStoreById = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/store/id/{id}",
    summary: "Get store by id",
    tags: ["Store"],
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ context, input }) => {
    return (
      (await context.db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, input.id),
      })) ?? null
    )
  })
