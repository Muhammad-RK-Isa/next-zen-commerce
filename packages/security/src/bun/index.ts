import arcjet, { shield } from "@arcjet/bun"
export * as nosecone from "nosecone"

import { env } from "../env"

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
  validateEmail,
  tokenBucket,
} from "@arcjet/bun"

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
})
