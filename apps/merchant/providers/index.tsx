'use client';

import type * as React from 'react';

import { UIProvider } from '@nzc/ui/provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <UIProvider>{children}</UIProvider>;
}
