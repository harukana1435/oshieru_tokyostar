import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { transactions, accounts } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const transactionsRoute = new Hono<Env>();

transactionsRoute.use('*', authMiddleware);

// 取引一覧取得
transactionsRoute.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  const userTransactions = await db.select({
    id: transactions.id,
    accountId: transactions.accountId,
    amount: transactions.amount,
    sign: transactions.sign,
    purpose: transactions.purpose,
    memo: transactions.memo,
    eventAt: transactions.eventAt,
    createdAt: transactions.createdAt,
    accountName: accounts.name,
    accountKind: accounts.kind,
  })
  .from(transactions)
  .leftJoin(accounts, eq(transactions.accountId, accounts.id))
  .where(eq(accounts.userId, userId))
  .orderBy(desc(transactions.eventAt))
  .limit(50);
  
  return c.json(userTransactions);
});

// 取引作成
transactionsRoute.post('/', async (c) => {
  const userId = c.get('userId');
  const { accountId, amount, sign, purpose, memo } = await c.req.json();
  
  if (!accountId || !amount || !sign || !purpose) {
    return c.json({ error: 'accountId, amount, sign, and purpose are required' }, 400);
  }
  
  if (amount <= 0) {
    return c.json({ error: 'Amount must be positive' }, 400);
  }
  
  if (sign !== 'in' && sign !== 'out') {
    return c.json({ error: 'Sign must be "in" or "out"' }, 400);
  }
  
  const db = c.get('db');
  
  // 口座の所有者確認
  const account = await db.select().from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .get();
  
  if (!account) {
    return c.json({ error: 'Account not found' }, 404);
  }
  
  // 取引作成
  const newTransaction = await db.insert(transactions).values({
    accountId,
    amount,
    sign,
    purpose,
    memo,
    eventAt: new Date(),
  }).returning().get();
  
  // 口座残高更新
  const balanceChange = sign === 'in' ? amount : -amount;
  await db.update(accounts)
    .set({ balanceCached: account.balanceCached + balanceChange })
    .where(eq(accounts.id, accountId));
  
  return c.json(newTransaction, 201);
});

// 特定口座の取引履歴
transactionsRoute.get('/account/:accountId', async (c) => {
  const userId = c.get('userId');
  const accountId = c.req.param('accountId');
  const db = c.get('db');
  
  // 口座の所有者確認
  const account = await db.select().from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .get();
  
  if (!account) {
    return c.json({ error: 'Account not found' }, 404);
  }
  
  const accountTransactions = await db.select().from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.eventAt));
  
  return c.json(accountTransactions);
});

export { transactionsRoute as transactionRoutes }; 