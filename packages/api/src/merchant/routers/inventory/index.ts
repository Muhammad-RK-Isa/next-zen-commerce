import { deleteInventoryItem } from "./delete-inventory-item"
import { getInventoryItem } from "./get-inventory-item"
import { getInventoryItemQuantityRange } from "./get-inventory-item-quantity-range"
import { listInventoryItems } from "./list-inventory-items"

export const inventoryRouter = {
  get: getInventoryItem,
  list: listInventoryItems,
  getQuantityRange: getInventoryItemQuantityRange,
  delete: deleteInventoryItem,
}
