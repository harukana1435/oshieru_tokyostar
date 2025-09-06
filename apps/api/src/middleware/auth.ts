import type { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '@oshieru/db/src/schema';
import type { Env } from '../index';

export const authMiddleware = async (c: Context<Env>, next: Next) => {
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');
  const userEmail = c.req.header('X-User-Email');
  
  if (!sessionId) {
    return c.json({ error: 'Authorization header required' }, 401);
  }
  
  // デモセッションの場合は簡易認証
  if (sessionId.startsWith('demo-session-')) {
    console.log('Demo session auth for email:', userEmail);
    
    if (!userEmail) {
      return c.json({ error: 'User email required for demo session' }, 401);
    }
    
    // メールアドレスからユーザーIDを推定
    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.email, userEmail)).get();
    
    console.log('Found user:', user);
    
    if (!user) {
      return c.json({ error: 'User not found', email: userEmail }, 401);
    }
    
    c.set('userId', user.id);
    console.log('Set userId:', user.id);
    await next();
    return;
  }
  
  // 通常のセッション認証
  const sessionData = await c.env.KV.get(`session:${sessionId}`);
  if (!sessionData) {
    return c.json({ error: 'Invalid session' }, 401);
  }
  
  const session = JSON.parse(sessionData);
  c.set('userId', session.userId);
  
  await next();
}; 