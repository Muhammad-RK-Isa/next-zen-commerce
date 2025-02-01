"use client";

import React from "react";
import {
  FileAudio2Icon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
} from "lucide-react";

import type { AppRouterOutputs } from "@nzc/api/app";
import type {
  DataTableAdvancedFilterField,
  DataTableFilterField,
} from "@nzc/ui/utils/types";
import { files } from "@nzc/db/schema";
import { DataTable } from "@nzc/ui/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@nzc/ui/components/data-table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@nzc/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nzc/ui/utils/use-data-table";

import { toSentenceCase } from "~/lib/utils";
import { useFeatureFlags } from "./feature-flags";
import { getColumns } from "./files-table-columns";
import { FilesTableToolbarActions } from "./files-table-toolbar-actions";

interface FilesTableProps {
  promise: Promise<AppRouterOutputs["file"]["list"]>;
}

export function FilesTable({ promise }: FilesTableProps) {
  const { featureFlags } = useFeatureFlags();

  const { data, pageCount } = React.use(promise);

  const columns = getColumns();

  const filterFields: DataTableFilterField<
    AppRouterOutputs["file"]["list"]["data"][number]
  >[] = [
    {
      id: "name",
      label: "File name",
      placeholder: "Filter by file name...",
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<
    AppRouterOutputs["file"]["list"]["data"][number]
  >[] = [
    {
      id: "name",
      label: "File name",
      placeholder: "Filter by file name...",
      type: "text",
    },
    {
      id: "type",
      label: "File type",
      placeholder: "Filter by file type...",
      type: "multi-select",
      options: files.type.enumValues.map((type) => ({
        label: toSentenceCase(type),
        value: type,
        count: 4,
        icon:
          type === "image"
            ? ImageIcon
            : type === "video"
              ? FileVideoIcon
              : type === "audio"
                ? FileAudio2Icon
                : FileTextIcon,
      })),
    },
  ];

  const enableAdvancedFilter = featureFlags.includes("advancedTable");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: {
        left: ["select", "name"],
      },
    },
    getRowId: (originalRow, idx) => `${originalRow.id}-${idx}`,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <DataTable table={table}>
      {enableAdvancedFilter ? (
        <DataTableAdvancedToolbar
          table={table}
          filterFields={advancedFilterFields}
          shallow={false}
        >
          <FilesTableToolbarActions />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} filterFields={filterFields}>
          <FilesTableToolbarActions />
        </DataTableToolbar>
      )}
    </DataTable>
  );
}
