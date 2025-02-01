"use client";

import React from "react";
import { notFound } from "next/navigation";
import { useQueryState } from "nuqs";

import { DataTableSkeleton } from "@nzc/ui/components/data-table/data-table-skeleton";
// import { filesSearchParamsCache } from "@nzc/validators/app";
import { getValidFilters } from "@nzc/ui/utils/data-table";

import type { SearchParams } from "~/lib/types";
import { trpcServerUtils } from "~/trpc/server";
import { FeatureFlagsProvider } from "./_components/data-table/feature-flags";
import { FilesTable } from "./_components/data-table/files-table";

export default function FilesPage() {
  // const search = useQueryState(filesSearchParamsCache.all);
  // const validFilters = getValidFilters(search.filters);

  // const store = await trpcServerUtils.store.getByHandle.fetch(handle);

  // if (!store) {
  //   notFound();
  // }

  return (
    <FeatureFlagsProvider>
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={1}
            rowCount={10}
            searchableColumnCount={1}
            shrinkZero
          />
        }
      >
        {/* <FilesTable /> */}
      </React.Suspense>
    </FeatureFlagsProvider>
  );
}
