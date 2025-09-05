import type { Context, Next } from 'hono';
import type { Env } from '../index';
export declare const authMiddleware: (c: Context<Env>, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}>) | undefined>;
//# sourceMappingURL=auth.d.ts.map