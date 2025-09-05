import { Hono } from 'hono';
import { eq, and, gte, sql } from 'drizzle-orm';
import { transactions, accounts } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const analysisRoute = new Hono<Env>();

analysisRoute.use('*', authMiddleware);

// 推し活支出分析
analysisRoute.get('/oshi-spending', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  try {
    // 過去6ヶ月のデータを取得
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 推し活関連の支出を集計
    const oshiTransactions = await db.select({
      purpose: transactions.purpose,
      amount: transactions.amount,
      eventAt: transactions.eventAt,
      accountKind: accounts.kind,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(
      eq(accounts.userId, userId),
      eq(transactions.sign, 'out'),
      gte(transactions.eventAt, sixMonthsAgo)
    ));
    
    // 推し活関連の取引をフィルタ
    const oshiPurposes = ['ticket', 'goods', 'event'];
    const oshiSpending = oshiTransactions.filter(t => 
      oshiPurposes.includes(t.purpose) || t.accountKind === 'oshi'
    );
    
    // 生活費の取引をフィルタ
    const lifePurposes = ['food', 'rent', 'utilities', 'transport'];
    const lifeSpending = oshiTransactions.filter(t => 
      lifePurposes.includes(t.purpose) || t.accountKind === 'life'
    );
    
    // 収入を集計（salary目的のin取引）
    const incomeTransactions = await db.select({
      amount: transactions.amount,
      eventAt: transactions.eventAt,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(and(
      eq(accounts.userId, userId),
      eq(transactions.sign, 'in'),
      eq(transactions.purpose, 'salary'),
      gte(transactions.eventAt, sixMonthsAgo)
    ));
    
    // 月別集計
    const monthlyData: { [key: string]: { income: number; oshi: number; life: number } } = {};
    
    // 収入の月別集計
    incomeTransactions.forEach(t => {
      const month = t.eventAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = { income: 0, oshi: 0, life: 0 };
      monthlyData[month].income += t.amount;
    });
    
    // 推し活支出の月別集計
    oshiSpending.forEach(t => {
      const month = t.eventAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, oshi: 0, life: 0 };
      monthlyData[month].oshi += t.amount;
    });
    
    // 生活費支出の月別集計
    lifeSpending.forEach(t => {
      const month = t.eventAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, oshi: 0, life: 0 };
      monthlyData[month].life += t.amount;
    });
    
    // 結果を整形
    const monthlyBreakdown = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        oshiExpense: data.oshi,
        lifeExpense: data.life,
        oshiRatio: data.income > 0 ? (data.oshi / data.income) * 100 : 0,
      }));
    
    // 目的別集計
    const purposeData: { [key: string]: number } = {};
    oshiSpending.forEach(t => {
      purposeData[t.purpose] = (purposeData[t.purpose] || 0) + t.amount;
    });
    
    const categoryBreakdown = Object.entries(purposeData).map(([purpose, amount]) => ({
      purpose,
      amount,
      percentage: oshiSpending.reduce((sum, t) => sum + t.amount, 0) > 0 
        ? (amount / oshiSpending.reduce((sum, t) => sum + t.amount, 0)) * 100 
        : 0,
    }));
    
    // 総計
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOshiExpense = oshiSpending.reduce((sum, t) => sum + t.amount, 0);
    const oshiRatio = totalIncome > 0 ? (totalOshiExpense / totalIncome) * 100 : 0;
    
    return c.json({
      totalIncome,
      totalOshiExpense,
      oshiRatio,
      monthlyBreakdown,
      categoryBreakdown,
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to analyze spending data' }, 500);
  }
});

export { analysisRoute as analysisRoutes }; 