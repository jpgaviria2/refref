-- Migration: MVP Wallet Tables
-- Created manually for SQLite

CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_name TEXT NOT NULL,
  reward_percentage REAL NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mnemonic TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  top_ups TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mint_url TEXT NOT NULL,
  keyset_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  secret TEXT NOT NULL,
  c TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT NOT NULL UNIQUE,
  total_amount REAL NOT NULL,
  customer_email TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE reward_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reward_id INTEGER NOT NULL REFERENCES rewards(id),
  token_string TEXT NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
