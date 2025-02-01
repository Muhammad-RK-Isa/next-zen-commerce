import { createRouteHandler } from "uploadthing/server";

import { env } from "@nzc/env";

import { uploadRouter } from "./core";

export const handlers = createRouteHandler({
  router: uploadRouter,
  config: { token: env.UPLOADTHING_TOKEN },
});

export { useUploadFile } from "./use-upload-file";
