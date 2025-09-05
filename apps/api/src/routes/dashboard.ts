import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { users, accounts, scores, transactions, rewards, userRewards } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const dashboardRoute = new Hono<{ Bindings: Env }>();

dashboardRoute.use('*', authMiddleware);

// ダッシュボードデータ取得
dashboardRoute.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  try {
    // ユーザー情報取得
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 口座情報取得
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    
    // 最新スコア取得
    const latestScore = await db.select().from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.snapshotAt))
      .limit(1)
      .get();
    
    // 最近の取引履歴取得
    const recentTransactions = await db.select({
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
    .limit(10);
    
    // 利用可能な特典取得
    const availableRewards = await db.select().from(rewards)
      .where(eq(rewards.active, true));
    
    // ユーザーの特典状況取得
    const myRewards = await db.select().from(userRewards)
      .where(eq(userRewards.userId, userId));
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      accounts: userAccounts,
      latestScore: latestScore ? {
        ...latestScore,
        factors: JSON.parse(latestScore.factors as string),
      } : null,
      recentTransactions,
      availableRewards,
      userRewards: myRewards,
    });
    
  } catch (error) {
    console.error('Dashboard data error:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

export { dashboardRoute as dashboardRoutes }; 