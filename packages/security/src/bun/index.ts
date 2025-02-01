import arcjet, { shield } from "@arcjet/bun";
import nosecone from "nosecone";

import { env } from "@nzc/env";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@arcjet/bun";

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export { nosecone };
