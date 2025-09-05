import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { accounts } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const accountsRoute = new Hono<{ Bindings: Env }>();

// 認証ミドルウェアを適用
accountsRoute.use('*', authMiddleware);

// ユーザーの口座一覧取得
accountsRoute.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
  
  return c.json(userAccounts);
});

// 口座作成
accountsRoute.post('/', async (c) => {
  const userId = c.get('userId');
  const { kind, name } = await c.req.json();
  
  if (!kind || !name) {
    return c.json({ error: 'Kind and name are required' }, 400);
  }
  
  if (kind !== 'life' && kind !== 'oshi') {
    return c.json({ error: 'Kind must be "life" or "oshi"' }, 400);
  }
  
  const db = c.get('db');
  
  const newAccount = await db.insert(accounts).values({
    userId,
    kind,
    name,
    balanceCached: 0,
  }).returning().get();
  
  return c.json(newAccount, 201);
});

// 口座詳細取得
accountsRoute.get('/:id', async (c) => {
  const userId = c.get('userId');
  const accountId = c.req.param('id');
  const db = c.get('db');
  
  const account = await db.select().from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .get();
  
  if (!account) {
    return c.json({ error: 'Account not found' }, 404);
  }
  
  return c.json(account);
});

// 口座更新
accountsRoute.put('/:id', async (c) => {
  const userId = c.get('userId');
  const accountId = c.req.param('id');
  const { name } = await c.req.json();
  
  if (!name) {
    return c.json({ error: 'Name is required' }, 400);
  }
  
  const db = c.get('db');
  
  const updatedAccount = await db.update(accounts)
    .set({ name })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .returning()
    .get();
  
  if (!updatedAccount) {
    return c.json({ error: 'Account not found' }, 404);
  }
  
  return c.json(updatedAccount);
});

export { accountsRoute as accountRoutes }; 