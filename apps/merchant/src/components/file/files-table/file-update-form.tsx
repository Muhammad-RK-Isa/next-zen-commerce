import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nzc/ui/components/form"
import { Input } from "@nzc/ui/components/input"
import { Skeleton } from "@nzc/ui/components/skeleton"
import { Textarea } from "@nzc/ui/components/textarea"
import { cn } from "@nzc/ui/lib/utils"
import type { UpdateFileSchemaType } from "@nzc/validators/merchant"
import type React from "react"
import type { UseFormReturn } from "react-hook-form"

interface FileUpdateFormProps
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  children: React.ReactNode
  form: UseFormReturn<UpdateFileSchemaType>
  onSubmit: (data: UpdateFileSchemaType) => void
  fileName: string
  isLoading: boolean
}

export function FileUpdateForm({
  onSubmit,
  form,
  fileName,
  children,
  isLoading,
  className,
}: FileUpdateFormProps) {
  const fileNameExtension = fileName.substring(fileName.lastIndexOf("."))

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col space-y-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <div className="relative">
                    <Input
                      {...field}
                      value={field.value}
                      name={undefined}
                      className="pr-14"
                    />
                    <span
                      aria-disabled
                      className="text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 text-sm"
                    >
                      {fileNameExtension}
                    </span>
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="alt"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt Text</FormLabel>
              <FormControl>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    {...field}
                    value={field.value ?? undefined}
                    name={undefined}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                {isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <Textarea
                    {...field}
                    value={field.value ?? undefined}
                    name={undefined}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  )
}
