import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, accounts } from '@oshieru/db/src/schema';
import type { Env } from '../index';

const usersRoute = new Hono<Env>();

// 全ユーザーの基本情報と残高を取得（デモ用）
usersRoute.get('/demo', async (c) => {
  const db = c.get('db');

  try {
    // 全ユーザーを取得
    const allUsers = await db.select().from(users);
    
    // 各ユーザーの口座情報を取得
    const usersWithBalance = await Promise.all(
      allUsers.map(async (user) => {
        const userAccounts = await db.select()
          .from(accounts)
          .where(eq(accounts.userId, user.id));
        
        const lifeAccount = userAccounts.find(acc => acc.kind === 'life');
        const oshiAccount = userAccounts.find(acc => acc.kind === 'oshi');
        
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          lifeBalance: lifeAccount?.balanceCached || 0,
          oshiBalance: oshiAccount?.balanceCached || 0,
          totalBalance: (lifeAccount?.balanceCached || 0) + (oshiAccount?.balanceCached || 0)
        };
      })
    );

    return c.json({
      success: true,
      users: usersWithBalance
    });
  } catch (error) {
    console.error('Error fetching demo users:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, 500);
  }
});

export { usersRoute }; 