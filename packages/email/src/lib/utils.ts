import { env } from "@nzc/env";

export function getAdminBaseUrl() {
  return env.PUBLIC_APP_URL;
}

export function getStoreBaseUrl() {
  return env.PUBLIC_STORE_URL;
}
