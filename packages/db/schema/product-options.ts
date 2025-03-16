import { products } from '@nzc/db/schema';
import { pgTable } from 'drizzle-orm/pg-core';
import { generateId, lifecycleDates } from '../utils';

export const productOptions = pgTable('product_options', (t) => ({
  id: t
    .text('id')
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId({ prefix: 'prod_opt' })),
  productId: t
    .text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: t.text('name').notNull(),
  ...lifecycleDates,
}));
