import { z } from "zod"
import { merchAuthedProcedure } from "~/merchant/orpc"
import { genericOutputSchema } from "~/utils"

export const terminateSession = merchAuthedProcedure
  .route({
    method: "DELETE",
    path: "/auth/session/{id}",
    tags: ["Auth"],
    summary: "Terminate a session",
  })
  .input(z.object({ id: z.string() }))
  .output(genericOutputSchema)
  .handler(async ({ context, input }) => {
    await context.redis.deleteUserSession(input.id)

    return {
      success: true,
      message: "Session terminated successfully",
    }
  })
