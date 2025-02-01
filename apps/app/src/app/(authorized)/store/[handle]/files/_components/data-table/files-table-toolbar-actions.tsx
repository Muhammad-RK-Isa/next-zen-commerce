"use client";

import React from "react";

import { RefreshButton } from "@nzc/ui/components/refresh-button";

export function FilesTableToolbarActions() {
  return (
    <div className="inline-flex items-center space-x-2">
      <RefreshButton />
    </div>
  );
}
