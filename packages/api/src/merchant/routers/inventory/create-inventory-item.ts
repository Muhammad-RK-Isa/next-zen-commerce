import { merchActiveStoreProcedure } from "~/merchant/orpc"

export const createInventoryItem = merchActiveStoreProcedure.route({
  method: "POST",
  path: "/inventory/create",
  tags: ["Inventory"],
  summary: "Create an inventory item",
})
// .input(schema)
