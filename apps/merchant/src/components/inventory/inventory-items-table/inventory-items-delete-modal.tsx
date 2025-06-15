import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@nzc/ui/components/alert-dialog"
import { buttonVariants } from "@nzc/ui/components/button"
import { Spinner } from "@nzc/ui/components/spinner"
import { cn } from "@nzc/ui/lib/utils"
import { isDefinedError } from "@orpc/client"
import { useMutation } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import type React from "react"
import { toast } from "sonner"

interface InventoryItemsDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemIds: string[]
  onSuccess?: () => void
}

export function InventoryItemsDeleteModal({
  open,
  onOpenChange,
  itemIds,
  onSuccess,
}: InventoryItemsDeleteModalProps) {
  const isSingle = Array.isArray(itemIds) && itemIds.length === 1

  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout",
  })

  const { mutateAsync: deleteFileSync, isPending: isDeleting } = useMutation(
    orpc.inventory.delete.mutationOptions()
  )

  async function handleDeletion(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault()
    await Promise.all(
      itemIds.map(
        async (id) =>
          await deleteFileSync(
            { id },
            {
              onSuccess: async () => {
                await queryClient.invalidateQueries({
                  queryKey: orpc.file.list.key(),
                })
              },
              onError: (error) => {
                if (isDefinedError(error)) {
                  toast.error(error.message)
                }
              },
            }
          )
      )
    )
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isSingle ? "this file?" : `${itemIds.length} files?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the selected files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDeletion}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner /> : null}
            {isDeleting ? "Deleting" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
