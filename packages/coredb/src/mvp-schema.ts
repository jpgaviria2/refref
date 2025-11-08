import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const storeSettings = sqliteTable('store_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeName: text('store_name').notNull(),
  rewardPercentage: real('reward_percentage').notNull(), // e.g., 0.05 for 5%
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const wallets = sqliteTable('wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mnemonic: text('mnemonic').notNull(), // encrypted or hashed for security
  balance: integer('balance').notNull().default(0), // in sats or smallest unit
  topUps: text('top_ups', { mode: 'json' }).$type<{ amount: number; timestamp: Date }[]>().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const proofs = sqliteTable('proofs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mintUrl: text('mint_url').notNull(),
  keysetId: text('keyset_id').notNull(),
  amount: integer('amount').notNull(),
  secret: text('secret').notNull(),
  c: text('c').notNull(), // blinded signature
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  externalId: text('external_id').notNull().unique(), // from Square/Shopify
  totalAmount: real('total_amount').notNull(), // order total in USD or equivalent
  customerEmail: text('customer_email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const rewards = sqliteTable('rewards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  amount: integer('amount').notNull(), // reward amount in sats
  status: text('status').notNull().default('pending'), // 'pending', 'issued', 'sent'
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const rewardPayouts = sqliteTable('reward_payouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  rewardId: integer('reward_id').references(() => rewards.id).notNull(),
  tokenString: text('token_string').notNull(), // Cashu token string
  emailSent: integer('email_sent', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
