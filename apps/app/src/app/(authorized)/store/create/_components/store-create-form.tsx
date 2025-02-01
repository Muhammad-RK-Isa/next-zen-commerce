"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { StoreCreateSchemaType } from "@nzc/validators/app";
import { Button } from "@nzc/ui/components/button";
import {
  Form,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
} from "@nzc/ui/components/form";
import { storeCreateSchema } from "@nzc/validators/app";

import { api } from "~/trpc/react";

export function StoreCreateForm() {
  const router = useRouter();

  const form = useForm<StoreCreateSchemaType>({
    resolver: zodResolver(storeCreateSchema),
    defaultValues: {
      name: "",
      handle: "",
    },
  });

  const { mutate, isPending } = api.store.create.useMutation({
    onSuccess: () => {
      toast.success("Store created");
      router.push(`/store/${form.getValues("handle")}`);
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        form.setError("handle", { message: err.message });
      }
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2.5 space-y-0">
              <FormInput {...field} placeholder="Name" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormInput {...field} placeholder="Handle" />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isPending}
          loading={isPending}
          iconPosition="right"
          icon={<CornerDownLeft />}
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
