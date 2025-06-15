import { createStore } from "./create-store"
import { deleteStore } from "./delete-store"
import { getActiveStore } from "./get-active-store"
import { getStoreByHandle } from "./get-store-by-handle"
import { getStoreById } from "./get-store-by-id"
import { hasStore } from "./has-store"
import { listStores } from "./list-stores"
import { setActiveStore } from "./set-active-store"
import { updateStore } from "./update-store"

export const storeRouter = {
  getById: getStoreById,
  getByHandle: getStoreByHandle,
  getActive: getActiveStore,
  hasStore,
  list: listStores,
  setActive: setActiveStore,
  create: createStore,
  update: updateStore,
  delete: deleteStore,
}
