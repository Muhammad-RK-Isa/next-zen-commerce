import arcjet, { shield } from "@arcjet/next";

import { env } from "@nzc/env";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
  request,
} from "@arcjet/next";

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
