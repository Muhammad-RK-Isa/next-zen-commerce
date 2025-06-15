import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nzc/ui/components/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@nzc/ui/components/sheet"
import { updateFileSchema } from "@nzc/validators/merchant"
import type { UpdateFileSchemaType } from "@nzc/validators/merchant"
import { isDefinedError } from "@orpc/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { CornerDownLeftIcon } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { FileUpdateForm } from "./file-update-form"

interface FileUpdateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
}

export function FileUpdateSheet({
  open,
  onOpenChange,
  fileId,
}: FileUpdateSheetProps) {
  const { orpc, queryClient } = useRouteContext({
    from: "/_authorized-layout/_dashboard-layout/files",
  })

  const { data, isPending: isDataPending } = useQuery(
    orpc.file.get.queryOptions({ input: { id: fileId } })
  )

  const { mutate: update, isPending: isUpdating } = useMutation(
    orpc.file.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.file.get.key({
            input: { id: fileId },
          }),
        })
        await queryClient.invalidateQueries({
          queryKey: orpc.file.list.key(),
        })
        onOpenChange(false)
      },
      onError: (error) => {
        if (isDefinedError(error)) {
          toast.error(error.message)
        } else {
          toast.error("Something went wrong.")
        }
      },
    })
  )

  const form = useForm<UpdateFileSchemaType>({
    resolver: zodResolver(updateFileSchema),
    disabled: isDataPending || isUpdating,
  })

  function handleSubmit(input: UpdateFileSchemaType) {
    if (isDataPending) {
      toast.info("File is not loaded yet.")
    }
    update(input)
  }

  const isDirty = React.useCallback(() => {
    if (!data) {
      return false
    }

    return Object.entries(data).some(([key, value]) => {
      if (key === "name") {
        const nameWithoutExtension = data.name.split(".").slice(0, -1).join(".")
        return (
          form.getValues("name" as keyof UpdateFileSchemaType) !==
          nameWithoutExtension
        )
      }
      if (key in updateFileSchema.shape) {
        return form.getValues(key as keyof UpdateFileSchemaType) !== value
      }
      return false
    })
  }, [form, data])

  React.useEffect(() => {
    if (data) {
      ;(Object.keys(data) as Array<keyof typeof data>).forEach((item) => {
        if (item in updateFileSchema.shape || item !== "name") {
          form.setValue(
            item as keyof UpdateFileSchemaType,
            data[item as keyof UpdateFileSchemaType]
          )
        }
      })
      form.setValue("name", data.name.split(".").slice(0, -1).join("."))
    }
  }, [data])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Edit file</SheetTitle>
          <SheetDescription>Update file details</SheetDescription>
        </SheetHeader>
        <FileUpdateForm
          form={form}
          onSubmit={handleSubmit}
          isLoading={isDataPending}
          fileName={data?.name ?? ""}
          className="p-4 pt-0 grow"
        >
          <div className="sm:flex-row flex mt-auto gap-2">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="grow"
                type="button"
                disabled={isUpdating || isDataPending}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className="grow"
              type="submit"
              iconPosition="right"
              icon={<CornerDownLeftIcon />}
              disabled={isUpdating || isDataPending || !isDirty}
              loading={isUpdating}
            >
              {isUpdating ? "Saving" : "Save"}
            </Button>
          </div>
        </FileUpdateForm>
      </SheetContent>
    </Sheet>
  )
}
