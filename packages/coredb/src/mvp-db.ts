import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './mvp-schema';

// Use DATABASE_URL or default to in-memory
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || ':memory:';
const sqlite = new Database(dbPath);
export const mvpDb = drizzle(sqlite, { schema });
