import { TRPCError } from "@trpc/server";

import type { AppLookUpAccountInput } from "@nzc/validators/app";

import type { AppContext } from "../../trpc";

export async function lookUpAccount(
  ctx: AppContext,
  input: AppLookUpAccountInput,
) {
  const r = await ctx.db.query.users.findFirst({
    where: (t, { or, eq }) => or(eq(t.email, input.email)),
  });

  if (r) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `An account with the same ${input.email ? "email" : "phone number"} already exists`,
    });
  }
}
