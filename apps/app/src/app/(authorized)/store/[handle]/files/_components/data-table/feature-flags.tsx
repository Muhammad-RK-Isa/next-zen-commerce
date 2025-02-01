"use client";

import * as React from "react";
import { useQueryState } from "nuqs";

import type { DataTableConfig } from "@nzc/ui/config/data-table";

type FeatureFlagValue = DataTableConfig["featureFlags"][number]["value"];

interface FeatureFlagsContextProps {
  featureFlags: FeatureFlagValue[];
  setFeatureFlags: (value: FeatureFlagValue[]) => void;
}

const FeatureFlagsContext = React.createContext<FeatureFlagsContextProps>({
  featureFlags: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFeatureFlags: () => {},
});

export function useFeatureFlags() {
  const context = React.useContext(FeatureFlagsContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [featureFlags, setFeatureFlags] = useQueryState<FeatureFlagValue[]>(
    "flags",
    {
      defaultValue: [],
      parse: (value) => value.split(",") as FeatureFlagValue[],
      serialize: (value) => value.join(","),
      eq: (a, b) =>
        a.length === b.length && a.every((value, index) => value === b[index]),
      clearOnDefault: true,
      shallow: false,
    },
  );

  return (
    <FeatureFlagsContext.Provider
      value={{
        featureFlags,
        setFeatureFlags: (value) => void setFeatureFlags(value),
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}
