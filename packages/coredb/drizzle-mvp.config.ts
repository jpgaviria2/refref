import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/mvp-schema.ts',
  out: './drizzle-mvp',
  dialect: 'sqlite',
  dbCredentials: {
    url: './mvp.db', // or process.env.DATABASE_URL
  },
});
