import { Hono } from 'hono';
import { eq, desc, and, gte } from 'drizzle-orm';
import { users, accounts, scores, transactions, rewards, userRewards } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const dashboardRoute = new Hono<Env>();

dashboardRoute.use('*', authMiddleware);

// ダッシュボードデータ取得（POST版 - フロントエンド互換性のため）
dashboardRoute.post('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  // リクエストボディから並べ替えオプションを取得
  let sortBy = 'date';
  let sortOrder = 'desc';
  
  try {
    const body = await c.req.json();
    sortBy = body.sortBy || 'date';
    sortOrder = body.sortOrder || 'desc';
  } catch (e) {
    // JSONパースエラーは無視してデフォルト値を使用
  }
  
  console.log('Dashboard API (POST) called for userId:', userId, 'sortBy:', sortBy, 'sortOrder:', sortOrder);
  
  try {
    // ユーザー情報取得
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 口座情報取得と実際の残高計算
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    
    // 各口座の実際の残高を計算
    const accountsWithRealBalance = await Promise.all(userAccounts.map(async (account) => {
      // その口座の全取引を取得
      const accountTransactions = await db.select({
        amount: transactions.amount,
        sign: transactions.sign,
      })
      .from(transactions)
      .where(eq(transactions.accountId, account.id));
      
      // 残高を計算
      const calculatedBalance = accountTransactions.reduce((balance, tx) => {
        return balance + (tx.sign === 'in' ? tx.amount : -tx.amount);
      }, 0);
      
      // キャッシュされた残高と実際の残高が異なる場合は更新
      if (account.balanceCached !== calculatedBalance) {
        console.log(`Updating balance for account ${account.id}: ${account.balanceCached} -> ${calculatedBalance}`);
        await db.update(accounts)
          .set({ balanceCached: calculatedBalance })
          .where(eq(accounts.id, account.id));
      }
      
      return {
        ...account,
        balanceCached: calculatedBalance
      };
    }));
    
    // 最近の取引履歴取得
    const recentTransactions = await db.select({
      id: transactions.id,
      accountId: transactions.accountId,
      amount: transactions.amount,
      sign: transactions.sign,
      purpose: transactions.purpose,
      memo: transactions.memo,
      originalDescription: transactions.originalDescription,
      isAutoCategorized: transactions.isAutoCategorized,
      isPending: transactions.isPending,
      canEdit: transactions.canEdit,
      originalCode: transactions.originalCode,
      eventAt: transactions.eventAt,
      createdAt: transactions.createdAt,
      accountName: accounts.name,
      accountKind: accounts.kind,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(accounts.userId, userId))
    .orderBy(
      sortBy === 'amount' 
        ? (sortOrder === 'asc' ? transactions.amount : desc(transactions.amount))
        : (sortOrder === 'asc' ? transactions.eventAt : desc(transactions.eventAt))
    );
    
    console.log('Found', recentTransactions.length, 'transactions for user', userId);
    
    // 最新スコア取得
    const latestScore = await db.select().from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.snapshotAt))
      .limit(1)
      .get();
    
    // 利用可能な特典取得
    const availableRewards = await db.select().from(rewards)
      .where(eq(rewards.active, true));
    
    // ユーザーの特典状況取得
    const myRewards = await db.select().from(userRewards)
      .where(eq(userRewards.userId, userId));
    
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        },
        accounts: accountsWithRealBalance,
        totalBalance: accountsWithRealBalance.reduce((sum, acc) => sum + acc.balanceCached, 0),
        lifeAccount: accountsWithRealBalance.find(acc => acc.kind === 'life'),
        oshiAccount: accountsWithRealBalance.find(acc => acc.kind === 'oshi'),
        latestScore,
        recentTransactions,
        rewards: availableRewards,
        myRewards,
        transactionCount: recentTransactions.length
      }
    });
    
  } catch (error) {
    console.error('Dashboard POST error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ダッシュボードデータ取得（GET版 - 既存互換性のため）
dashboardRoute.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  // クエリパラメータから並べ替えオプションを取得
  const sortBy = c.req.query('sortBy') || 'date'; // date, amount
  const sortOrder = c.req.query('sortOrder') || 'desc'; // asc, desc
  
  console.log('Dashboard API called for userId:', userId, 'sortBy:', sortBy, 'sortOrder:', sortOrder);
  
  try {
    // ユーザー情報取得
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // 口座情報取得と実際の残高計算
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    
    // 各口座の実際の残高を計算
    const accountsWithRealBalance = await Promise.all(userAccounts.map(async (account) => {
      // その口座の全取引を取得
      const accountTransactions = await db.select({
        amount: transactions.amount,
        sign: transactions.sign,
      })
      .from(transactions)
      .where(eq(transactions.accountId, account.id));
      
      // 残高を計算
      const calculatedBalance = accountTransactions.reduce((balance, tx) => {
        return balance + (tx.sign === 'in' ? tx.amount : -tx.amount);
      }, 0);
      
      // キャッシュされた残高と実際の残高が異なる場合は更新
      if (account.balanceCached !== calculatedBalance) {
        console.log(`Updating balance for account ${account.id}: ${account.balanceCached} -> ${calculatedBalance}`);
        await db.update(accounts)
          .set({ balanceCached: calculatedBalance })
          .where(eq(accounts.id, account.id));
      }
      
      return {
        ...account,
        balanceCached: calculatedBalance
      };
    }));
    
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
      originalDescription: transactions.originalDescription,
      isAutoCategorized: transactions.isAutoCategorized,
      isPending: transactions.isPending,
      canEdit: transactions.canEdit,
      originalCode: transactions.originalCode,
      eventAt: transactions.eventAt,
      createdAt: transactions.createdAt,
      accountName: accounts.name,
      accountKind: accounts.kind,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(accounts.userId, userId))
    .orderBy(
      sortBy === 'amount' 
        ? (sortOrder === 'asc' ? transactions.amount : desc(transactions.amount))
        : (sortOrder === 'asc' ? transactions.eventAt : desc(transactions.eventAt))
    );
    
    console.log('Found', recentTransactions.length, 'transactions for user', userId);
    
    // 利用可能な特典取得
    const availableRewards = await db.select().from(rewards)
      .where(eq(rewards.active, true));
    
    // ユーザーの特典状況取得
    const myRewards = await db.select().from(userRewards)
      .where(eq(userRewards.userId, userId));
    
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        },
        accounts: accountsWithRealBalance,
              latestScore: latestScore ? {
        ...latestScore,
        factors: typeof latestScore.factors === 'string' 
          ? JSON.parse(latestScore.factors) 
          : latestScore.factors,
      } : null,
        recentTransactions,
        availableRewards,
        userRewards: myRewards,
      }
    });
    
  } catch (error) {
    console.error('Dashboard data error:', error);
    return c.json({ 
      error: 'Failed to fetch dashboard data', 
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: userId
    }, 500);
  }
});

// 振り分け未完了取引の取得
dashboardRoute.get('/pending-transactions', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  console.log('Pending transactions API called for userId:', userId);
  
  try {
    // 振り分け未完了の取引を取得
    const pendingTransactions = await db.select({
      id: transactions.id,
      accountId: transactions.accountId,
      amount: transactions.amount,
      sign: transactions.sign,
      purpose: transactions.purpose,
      memo: transactions.memo,
      originalDescription: transactions.originalDescription,
      isAutoCategorized: transactions.isAutoCategorized,
      isPending: transactions.isPending,
      canEdit: transactions.canEdit,
      originalCode: transactions.originalCode,
      eventAt: transactions.eventAt,
      createdAt: transactions.createdAt,
      accountName: accounts.name,
      accountKind: accounts.kind,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(eq(accounts.userId, userId), eq(transactions.isPending, true)))
    .orderBy(desc(transactions.eventAt));
    
    console.log('Found', pendingTransactions.length, 'pending transactions for user', userId);
    
    return c.json({
      success: true,
      data: pendingTransactions
    });
    
  } catch (error) {
    console.error('Pending transactions error:', error);
    return c.json({ 
      error: 'Failed to fetch pending transactions', 
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: userId
    }, 500);
  }
});

// スコア計算用の取引データ分析
dashboardRoute.get('/score-analysis', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  console.log('Score analysis API called for userId:', userId);
  
  try {
    // 3ヶ月前の日付を計算
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // まず3ヶ月以内の給与を検索
    let recentSalaryTransactions = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      eventAt: transactions.eventAt,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(
      eq(accounts.userId, userId),
      eq(transactions.purpose, 'salary'),
      eq(transactions.sign, 'in'),
      gte(transactions.eventAt, new Date(threeMonthsAgo.getTime()))
    ))
    .orderBy(desc(transactions.eventAt))
    .limit(1);
    
    // 3ヶ月以内に給与がない場合は1年まで拡張
    if (recentSalaryTransactions.length === 0) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      recentSalaryTransactions = await db.select({
        id: transactions.id,
        amount: transactions.amount,
        eventAt: transactions.eventAt,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(and(
        eq(accounts.userId, userId),
        eq(transactions.purpose, 'salary'),
        eq(transactions.sign, 'in'),
        gte(transactions.eventAt, new Date(oneYearAgo.getTime()))
      ))
      .orderBy(desc(transactions.eventAt))
      .limit(1);
    }
    
    if (recentSalaryTransactions.length === 0) {
      return c.json({
        success: false,
        error: 'No recent salary found in the last year'
      });
    }
    
    const latestSalaryDate = new Date(recentSalaryTransactions[0].eventAt);
    const salaryAmount = recentSalaryTransactions[0].amount;
    
    // 最新の給与振込以降の全取引を取得
    const transactionsAfterSalary = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      sign: transactions.sign,
      purpose: transactions.purpose,
      eventAt: transactions.eventAt,
      accountKind: accounts.kind,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(
      eq(accounts.userId, userId),
      gte(transactions.eventAt, new Date(latestSalaryDate.getTime()))
    ))
    .orderBy(desc(transactions.eventAt));
    
    // 推し活関連支出の計算
    const oshiExpenses = transactionsAfterSalary
      .filter(tx => 
        tx.sign === 'out' && 
        (tx.purpose === 'ticket' || tx.purpose === 'goods' || tx.purpose === 'event' || tx.accountKind === 'oshi')
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // 生活必需品費用の計算（otherカテゴリから推定）
    const essentialExpenses = transactionsAfterSalary
      .filter(tx => 
        tx.sign === 'out' && 
        (tx.purpose === 'rent' || tx.purpose === 'other') &&
        tx.accountKind === 'life'
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // 推奨推し活口座入金額（収入の20%）
    const recommendedAmount = salaryAmount * 0.2;
    
    console.log('Score analysis result:', {
      salaryAmount,
      oshiExpenses,
      essentialExpenses,
      recommendedAmount,
      transactionCount: transactionsAfterSalary.length,
      latestSalaryDate
    });
    
    return c.json({
      success: true,
      data: {
        income: salaryAmount,
        oshiExpense: oshiExpenses,
        essentialExpense: essentialExpenses,
        recommendedAmount: recommendedAmount,
        analysisDate: latestSalaryDate,
        transactionCount: transactionsAfterSalary.length,
        transactions: transactionsAfterSalary
      }
    });
    
  } catch (error) {
    console.error('Score analysis error:', error);
    return c.json({ 
      error: 'Failed to analyze transactions for score calculation', 
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: userId
    }, 500);
  }
});

export { dashboardRoute as dashboardRoutes }; 