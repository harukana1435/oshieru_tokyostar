import { Hono } from 'hono';
import { eq, desc, and, gte } from 'drizzle-orm';
import { scores, transactions, accounts } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

// AI機能付きスコア計算関数
function calculateSafetyScoreWithAI(income: number, oshiExpense: number, essentialExpense: number, recommendedAmount: number, transactions: any[], analysisData: any) {
  // [1] 収入比率スコア (40点満点)
  const incomeRatio = income > 0 ? oshiExpense / income : 0;
  
  let incomeRatioScore = 10;
  if (incomeRatio <= 0.20) incomeRatioScore = 40;
  else if (incomeRatio <= 0.30) incomeRatioScore = 30;
  else if (incomeRatio <= 0.40) incomeRatioScore = 20;
  
  // [2] 余剰金スコア (30点満点)
  const surplus = income - essentialExpense;
  const surplusRatio = surplus > 0 ? oshiExpense / surplus : Number.POSITIVE_INFINITY;
  
  let surplusScore = 0;
  if (surplusRatio <= 1.0) surplusScore = 30;
  else if (surplusRatio <= 1.2) surplusScore = 20;
  else if (surplusRatio <= 1.5) surplusScore = 10;
  
  // [3] 推奨額適合スコア (30点満点)
  const deviationRatio = recommendedAmount > 0 ? ((oshiExpense - recommendedAmount) / recommendedAmount) * 100 : 0;
  
  let recommendedAmountScore = 0;
  if (deviationRatio <= 10) recommendedAmountScore = 30;
  else if (deviationRatio <= 20) recommendedAmountScore = 20;
  else if (deviationRatio <= 50) recommendedAmountScore = 10;
  
  // 総合スコア計算
  const totalScore = incomeRatioScore + surplusScore + recommendedAmountScore;
  
  // ラベル決定
  let label = "危険";
  if (totalScore >= 80) label = "とても安心";
  else if (totalScore >= 60) label = "安心";
  else if (totalScore >= 40) label = "注意";
  
  // AI推奨事項を生成
  const aiRecommendations = [];
  if (totalScore >= 80) {
    aiRecommendations.push("🎉 素晴らしい推し活バランスです！この調子で健康的な推し活を続けましょう。");
  } else if (totalScore >= 60) {
    aiRecommendations.push("✅ 良好な推し活バランスを保っています。現在の水準を維持しましょう。");
  } else if (totalScore >= 40) {
    aiRecommendations.push("⚠️ 推し活支出に注意が必要です。以下の改善点を検討してください。");
  } else {
    aiRecommendations.push("🚨 推し活支出が危険水準です。緊急に見直しが必要です。");
  }
  
  if (incomeRatioScore < 30) {
    aiRecommendations.push(`💰 収入に対する推し活支出が${Math.round(incomeRatio * 100 * 100) / 100}%と高めです。20%以内に抑えることを目標にしましょう。`);
  }
  
  if (surplusScore < 20 && surplusRatio !== Number.POSITIVE_INFINITY) {
    aiRecommendations.push(`💡 余剰金に対する推し活支出が${Math.round(surplusRatio * 100) / 100}倍です。生活費の見直しで余剰金を増やすことを検討してください。`);
  }
  
  if (recommendedAmountScore < 20) {
    if (deviationRatio > 0) {
      aiRecommendations.push(`📊 推奨額より${Math.round(deviationRatio * 100) / 100}%多く支出しています。月次予算の設定をお勧めします。`);
    } else if (deviationRatio < -50) {
      aiRecommendations.push("💸 推奨額より大幅に少ない支出です。もう少し推し活を楽しんでも良いかもしれません。");
    }
  }
  
  // 具体的な金額提案
  if (oshiExpense > recommendedAmount * 1.2) {
    const targetReduction = oshiExpense - recommendedAmount;
    aiRecommendations.push(`🎯 目標: 月¥${Math.round(targetReduction).toLocaleString()}の支出削減で推奨額¥${Math.round(recommendedAmount).toLocaleString()}に近づけましょう。`);
  } else if (oshiExpense < recommendedAmount * 0.5) {
    const targetIncrease = recommendedAmount - oshiExpense;
    aiRecommendations.push(`🎯 余裕があれば月¥${Math.round(targetIncrease).toLocaleString()}まで推し活予算を増やせます。`);
  }
  
  // 支出パターン分析
  const oshiTransactions = transactions.filter(tx => 
    tx.sign === 'out' && 
    (tx.purpose === 'ticket' || tx.purpose === 'goods' || tx.purpose === 'event' || tx.accountKind === 'oshi')
  );
  
  const spendingAnalysis = {
    patterns: [] as string[],
    insights: [] as string[],
    recommendations: [] as string[],
    categoryBreakdown: {} as Record<string, number>,
    transactionCount: oshiTransactions.length,
    averageAmount: oshiTransactions.length > 0 ? Math.round(oshiTransactions.reduce((sum, tx) => sum + tx.amount, 0) / oshiTransactions.length) : 0
  };
  
  // カテゴリ別分析
  if (oshiTransactions.length > 0) {
    const categoryAmounts: Record<string, number> = {};
    oshiTransactions.forEach(tx => {
      const category = tx.purpose || 'other';
      categoryAmounts[category] = (categoryAmounts[category] || 0) + tx.amount;
    });
    
    spendingAnalysis.categoryBreakdown = categoryAmounts;
    
    const totalOshiAmount = Object.values(categoryAmounts).reduce((sum, amount) => sum + amount, 0);
    const dominantCategory = Object.entries(categoryAmounts).reduce((a, b) => a[1] > b[1] ? a : b);
    
    if (dominantCategory[1] > totalOshiAmount * 0.6) {
      const categoryNames: Record<string, string> = {
        'ticket': 'チケット',
        'goods': 'グッズ',
        'event': 'イベント'
      };
      const categoryName = categoryNames[dominantCategory[0]] || dominantCategory[0];
      spendingAnalysis.patterns.push(`${categoryName}への集中的な支出`);
      spendingAnalysis.insights.push(`${categoryName}: ¥${dominantCategory[1].toLocaleString()} (推し活支出の${Math.round(dominantCategory[1]/totalOshiAmount*100)}%)`);
      spendingAnalysis.recommendations.push("バランスの取れた推し活を心がけましょう");
    }
    
    // 高額支出の検出
    const maxAmount = Math.max(...oshiTransactions.map(tx => tx.amount));
    const avgAmount = spendingAnalysis.averageAmount;
    
    if (maxAmount > avgAmount * 3) {
      spendingAnalysis.patterns.push("高額な単発支出が見られます");
      spendingAnalysis.insights.push(`最大支出額: ¥${maxAmount.toLocaleString()} (平均の${Math.round(maxAmount/avgAmount*10)/10}倍)`);
      spendingAnalysis.recommendations.push("大きな支出は事前に予算計画を立てることをお勧めします");
    }
  }
  
  return {
    score: totalScore,
    label: label,
    factors: {
      incomeRatioScore,
      surplusScore,
      recommendedAmountScore,
      incomeRatio: Math.round(incomeRatio * 100 * 100) / 100,
      surplusRatio: surplusRatio === Number.POSITIVE_INFINITY ? 999.99 : Math.round(surplusRatio * 100) / 100,
      recommendedDeviation: Math.round(deviationRatio * 100) / 100
    },
    breakdown: {
      income,
      oshiExpense,
      essentialExpense,
      recommendedAmount,
      surplus,
      incomeRatioPercent: Math.round(incomeRatio * 100 * 100) / 100,
      surplusRatioValue: surplusRatio === Number.POSITIVE_INFINITY ? 999.99 : Math.round(surplusRatio * 100) / 100,
      deviationPercent: Math.round(deviationRatio * 100) / 100
    },
    spendingAnalysis,
    aiRecommendations,
    analysisData
  };
}



const scoresRoute = new Hono<Env>();

scoresRoute.use('*', authMiddleware);

// スコア履歴取得
scoresRoute.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  const userScores = await db.select().from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.snapshotAt));
  
  return c.json(userScores);
});

// 最新スコア取得
scoresRoute.get('/latest', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  const latestScore = await db.select().from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.snapshotAt))
    .limit(1)
    .get();
  
  if (!latestScore) {
    return c.json({ error: 'No score found' }, 404);
  }
  
  return c.json(latestScore);
});

// 実データに基づくスコア計算
scoresRoute.post('/calculate', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  try {
    // 直接データベースから取引分析データを取得
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
        error: 'No recent salary found for score calculation'
      }, 400);
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
    
    const income = salaryAmount;
    const oshiExpense = oshiExpenses;
    const essentialExpense = essentialExpenses;
    
    console.log('Score calculation with real data:', { income, oshiExpense, essentialExpense, recommendedAmount });
    
    // JavaScriptでスコア計算を実行（安定性のため）
    const scoreResult = calculateSafetyScoreWithAI(income, oshiExpense, essentialExpense, recommendedAmount, transactionsAfterSalary, {
      income,
      oshiExpense,
      essentialExpense,
      recommendedAmount,
      analysisDate: latestSalaryDate,
      transactionCount: transactionsAfterSalary.length
    });
    
    // スコアをデータベースに保存
    const newScore = await db.insert(scores).values({
      userId,
      score: scoreResult.score,
      label: scoreResult.label,
      snapshotAt: new Date(),
      factors: JSON.stringify(scoreResult.factors),
    }).returning().get();
    
    return c.json({
      ...newScore,
      analysisData: scoreResult.analysisData,
      factors: scoreResult.factors,
      breakdown: scoreResult.breakdown,
      spendingAnalysis: scoreResult.spendingAnalysis,
      aiRecommendations: scoreResult.aiRecommendations
    }, 201);
    
  } catch (error) {
    console.error('Real-data score calculation error:', error);
    return c.json({ error: 'Failed to calculate score with real data' }, 500);
  }
});

// マニュアルスコア計算（テスト用）
scoresRoute.post('/manual', async (c) => {
  const userId = c.get('userId');
  const { income, oshiExpense, essentialExpense } = await c.req.json();
  
  if (!income || income <= 0) {
    return c.json({ error: 'Valid income is required' }, 400);
  }
  
  try {
    // Score Worker を呼び出し
    const scoreResponse = await c.env.SCORE_WORKER.fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        income,
        oshiExpense: oshiExpense || 0,
        essentialExpense: essentialExpense || 0,
      }),
    });
    
    if (!scoreResponse.ok) {
      throw new Error('Score calculation failed');
    }
    
    const scoreResult = await scoreResponse.json() as any;
    
    // スコアをデータベースに保存
    const db = c.get('db');
    const newScore = await db.insert(scores).values({
      userId,
      score: scoreResult.score,
      label: scoreResult.label,
      snapshotAt: new Date(),
      factors: JSON.stringify(scoreResult.factors),
    }).returning().get();
    
    return c.json(newScore, 201);
    
  } catch (error) {
    console.error('Manual score calculation error:', error);
    return c.json({ error: 'Failed to calculate score' }, 500);
  }
});

export { scoresRoute as scoreRoutes }; 