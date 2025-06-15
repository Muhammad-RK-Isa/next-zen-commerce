import { merchAuthedProcedure } from "~/merchant/orpc"

export const getAllSessions = merchAuthedProcedure
  .route({
    method: "GET",
    path: "/auth/session/all",
    tags: ["Auth"],
    summary: "Get all sessions",
    description: "Get all sessions for the authenticated user",
  })
  .handler(async ({ context }) => {
    return await context.redis.getAllUserSessions(context.user.id)
  })
