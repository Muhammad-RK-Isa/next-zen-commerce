import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { auth } from ".";

export async function validateUserRequest({
  req,
  resHeaders,
}: {
  req: FetchCreateContextFnOptions["req"];
  resHeaders?: FetchCreateContextFnOptions["resHeaders"];
}) {
  const cookieHeader = req.headers.get("Cookie") ?? "";
  const sessionId = auth.readSessionCookie(cookieHeader);

  let session = null;
  let user = null;

  if (sessionId) {
    try {
      const sessionData = await auth.validateUserSession(sessionId);

      session = sessionData.session;
      user = sessionData.user;

      if (session && resHeaders) {
        const sessionCookie = auth
          .generateSessionCookie(session.id)
          .serialize();
        resHeaders.append("Set-Cookie", sessionCookie);
      }
    } catch {
      if (resHeaders) {
        const blankSessionCookie = auth
          .generateBlankSessionCookie()
          .serialize();
        resHeaders.append("Set-Cookie", blankSessionCookie);
      }
    }
  }
  return { user, session };
}
