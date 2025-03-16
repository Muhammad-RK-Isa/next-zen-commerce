import { index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

import { stores } from '@nzc/db/schema';
import { generateId, lifecycleDates, lower } from '@nzc/db/utils';

export const customers = pgTable(
  'customers',
  (t) => ({
    id: t
      .text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => generateId({ prefix: 'customer' })),
    name: t.text('name'),
    email: t.text('email'),
    emailVerified: t.boolean('email_verified').notNull().default(false),
    password: t.text('password'),
    storeId: t
      .text('store_id')
      .references(() => stores.id)
      .notNull(),
    ...lifecycleDates,
  }),
  (t) => [
    index('customer_name_idx').on(t.name),
    index('customer_password_idx').on(t.password),
    uniqueIndex('customer_email_store_idx').on(lower(t.email), t.storeId),
  ]
);
