import { auth } from "@nzc/auth/user"
import { merchAuthedProcedure, merchPubProcedure } from "~/merchant/orpc"
import { getAllSessions } from "./get-all-sessions"
import { signInWithDiscord } from "./sign-in-discord"
import { signInEmail } from "./sign-in-email"
import { signInWithGithub } from "./sign-in-github"
import { signInWithGoogle } from "./sign-in-google"
import { signUpEmail } from "./sign-up-email"
import { terminateSession } from "./terminate-session"
import { updateUserDetails } from "./update-user-details"
import { verifyAuthCode } from "./verify-auth-code"

export const authRouter = {
  signOut: merchAuthedProcedure
    .route({
      method: "POST",
      path: "/auth/signout",
      summary: "Sign out",
      tags: ["Auth"],
    })
    .handler(async ({ context }) => {
      await auth.invalidateSession(context.session.id)
      const blankSessionCookie = auth.generateBlankSessionCookie()
      context.res.headers.append("Set-Cookie", blankSessionCookie.serialize())
      return `Signed out of ${context.user.email}`
    }),
  session: merchPubProcedure
    .route({
      method: "GET",
      path: "/auth/session",
      summary: "Get user session",
      tags: ["Auth"],
    })
    .handler(({ context }) => {
      return {
        user: context.user,
        session: context.session,
      }
    }),
  getAllSessions,
  updateUserDetails,
  terminateSession,
  signInEmail,
  signUpEmail,
  signInGoogle: signInWithGoogle,
  signInDiscord: signInWithDiscord,
  signInGithub: signInWithGithub,
  verifyAuthCode,
}
