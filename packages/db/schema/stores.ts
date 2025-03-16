import { index, pgTable } from 'drizzle-orm/pg-core';

import type { StoreSettings } from '@nzc/db/types';
import { generateId, generateUniqueSlug, lifecycleDates } from '@nzc/db/utils';

const defaultSettings: StoreSettings = {
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
  notifications: {
    email: {
      customers: false,
      orders: true,
      promotions: true,
    },
    sms: {
      customers: false,
      orders: true,
      promotions: true,
    },
    push: {
      customers: false,
      orders: true,
      promotions: true,
    },
  },
};

export const stores = pgTable(
  'stores',
  (t) => ({
    id: t
      .text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: 'store' })),
    name: t.text('name').notNull(),
    handle: t
      .text('handle')
      .notNull()
      .$defaultFn(() => generateUniqueSlug()),
    fileId: t.text('file_id'),
    status: t
      .varchar('status', {
        length: 24,
        enum: ['active', 'inactive'],
      })
      .notNull()
      .default('active'),
    settings: t
      .json('settings')
      .$type<StoreSettings>()
      .notNull()
      .default(defaultSettings),
    ...lifecycleDates,
  }),
  (t) => [index('store_file_id_idx').on(t.fileId)]
);
