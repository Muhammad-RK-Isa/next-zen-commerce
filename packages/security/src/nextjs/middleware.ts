import type { NoseconeOptions } from "@nosecone/next";
import { defaults } from "@nosecone/next";

export { createMiddleware as noseconeMiddleware } from "@nosecone/next";

export const noseconeOptions: NoseconeOptions = {
  ...defaults,
  contentSecurityPolicy: false,
};
