import { auth } from "@nzc/auth";

import type { ProtectedAppContext } from "../../trpc";

export async function signOut(ctx: ProtectedAppContext) {
  console.log("Invalidating session");
  await auth.invalidateSession(ctx.session.id);
  const blankSessionCookie = auth.generateBlankSessionCookie().serialize();
  ctx.resHeaders.append("Set-Cookie", blankSessionCookie);
  return { success: true };
}
