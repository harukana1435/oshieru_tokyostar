import type { Context, Next } from 'hono';
import type { Env } from '../index';

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!sessionId) {
    return c.json({ error: 'Authorization header required' }, 401);
  }
  
  const sessionData = await c.env.KV.get(`session:${sessionId}`);
  if (!sessionData) {
    return c.json({ error: 'Invalid session' }, 401);
  }
  
  const session = JSON.parse(sessionData);
  c.set('userId', session.userId);
  
  await next();
}; 