import { deleteFile } from "./delete-file"
import { getFileById } from "./get-file-by-id"
import { listFiles } from "./list-files"
import { updateFile } from "./update-file"

export const fileRouter = {
  get: getFileById,
  list: listFiles,
  update: updateFile,
  delete: deleteFile,
}
