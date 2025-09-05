import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: '../../infra/cf/wrangler.toml',
    dbName: 'oshieru-db',
  },
} satisfies Config; 