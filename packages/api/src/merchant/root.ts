import { authRouter } from "./routers/auth"
import { fileRouter } from "./routers/file"
import { inventoryRouter } from "./routers/inventory"
import { storeRouter } from "./routers/store"

export const merchantRouter = {
  auth: authRouter,
  store: storeRouter,
  file: fileRouter,
  inventory: inventoryRouter,
}
