"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@nzc/ui/components/button";
import { Form, FormField, FormInput, FormItem } from "@nzc/ui/components/form";

const formSchema = z.object({
  name: z.string().min(2),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = form.handleSubmit((data) => {
    alert(JSON.stringify(data));
  });
  return (
    <div className="flex h-screen items-center justify-center">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormInput
                  {...field}
                  type="text"
                  placeholder="Let me guess, Isa?"
                />
              </FormItem>
            )}
          />
          <Button>Submit</Button>
        </form>
      </Form>
    </div>
  );
}
