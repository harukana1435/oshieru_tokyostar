import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
export type Env = {
    Bindings: {
        DB: D1Database;
        SCORE_WORKER: Fetcher;
        KV: KVNamespace;
    };
    Variables: {
        db: ReturnType<typeof drizzle>;
        userId: string;
    };
};
declare const app: Hono<Env, {}, "/">;
export default app;
//# sourceMappingURL=index.d.ts.map