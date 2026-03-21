import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema-system.ts',
	dialect: 'sqlite',
	dbCredentials: { url: process.env.DB_DIR ? `${process.env.DB_DIR}/system.db` : './data/system.db' },
	verbose: true,
	strict: true
});
