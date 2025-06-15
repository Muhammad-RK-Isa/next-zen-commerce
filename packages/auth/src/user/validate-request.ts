import type { CompositeUser, UserSession } from "@nzc/validators/common"
import { auth } from "."

export async function validateRequest(req: Request, res?: Response) {
  const cookieHeader = req.headers.get("Cookie") ?? ""
  const sessionId = auth.readSessionCookie(cookieHeader)

  let session: UserSession | null = null
  let user: CompositeUser | null = null

  if (sessionId) {
    try {
      const sessionData = await auth.validateUserSession(sessionId)

      session = sessionData.session
      user = sessionData.user

      if (session && res?.headers) {
        const sessionCookie = auth
          .generateSessionCookie(session.id, new Date(session.expiresAt))
          .serialize()
        res.headers.append("Set-Cookie", sessionCookie)
      }
    } catch {
      if (res?.headers) {
        const blankSessionCookie = auth.generateBlankSessionCookie().serialize()
        res.headers.append("Set-Cookie", blankSessionCookie)
      }
    }
  }
  return { user, session }
}
