import * as arctic from "arctic"

import { env } from "./env"

export const google = new arctic.Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.CORE_URL}/api/user/auth/callback/google`
)

export const github = new arctic.GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  `${env.CORE_URL}/api/user/auth/callback/github`
)

export const discord = new arctic.Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  `${env.CORE_URL}/api/user/auth/callback/discord`
)
