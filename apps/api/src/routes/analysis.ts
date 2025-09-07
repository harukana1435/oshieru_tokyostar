import { Hono } from 'hono';
import { eq, desc, and, gte } from 'drizzle-orm';
import { transactions, accounts, scores } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const analysisRoute = new Hono<Env>();

analysisRoute.use('*', authMiddleware);

// RAG分析エンドポイント
analysisRoute.post('/rag-analysis', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  try {
    // 直近3ヶ月の取引データを取得
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentTransactions = await db.select()
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(accounts.userId, userId),
          gte(transactions.eventAt, threeMonthsAgo)
        )
      )
      .orderBy(desc(transactions.eventAt));
    
    // 最新のスコア情報を取得
    const latestScore = await db.select()
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.snapshotAt))
      .limit(1)
      .get();
    
    // 口座残高情報を取得
    const userAccounts = await db.select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    
    // RAG分析用のデータを構築
    const analysisData = {
      // 基本情報
      analysisDate: new Date().toISOString(),
      analysisType: "推し活パターン分析",
      
      // スコア情報
      score: {
        total: latestScore?.score || 0,
        label: latestScore?.label || '評価中',
        factors: latestScore?.factors ? JSON.parse(latestScore.factors as string) : {},
        breakdown: latestScore && latestScore.factors ? (() => {
          const factors = JSON.parse(latestScore.factors as string);
          return {
            incomeRatioScore: factors.incomeRatioScore || 0,
            surplusScore: factors.surplusScore || 0,
            recommendedAmountScore: factors.recommendedAmountScore || 0
          };
        })() : {
          incomeRatioScore: 0,
          surplusScore: 0,
          recommendedAmountScore: 0
        }
      },
      
      // 口座情報
      accounts: {
        life: userAccounts.find(acc => acc.kind === 'life'),
        oshi: userAccounts.find(acc => acc.kind === 'oshi'),
        totalBalance: userAccounts.reduce((sum, acc) => sum + (acc.balanceCached || 0), 0)
      },
      
      // 取引情報（直近3ヶ月）
      transactions: recentTransactions.map(tx => ({
        date: tx.transactions.eventAt,
        amount: tx.transactions.amount,
        sign: tx.transactions.sign,
        purpose: tx.transactions.purpose,
        memo: tx.transactions.memo,
        accountType: tx.accounts?.kind,
        isAutoCategorized: tx.transactions.isAutoCategorized,
        isPending: tx.transactions.isPending
      })),
      
      // 集計情報
      summary: {
        totalTransactions: recentTransactions.length,
        oshiExpenses: recentTransactions
          .filter(tx => tx.transactions.sign === 'out' && tx.accounts?.kind === 'oshi')
          .reduce((sum, tx) => sum + tx.transactions.amount, 0),
        lifeExpenses: recentTransactions
          .filter(tx => tx.transactions.sign === 'out' && tx.accounts?.kind === 'life')
          .reduce((sum, tx) => sum + tx.transactions.amount, 0),
        income: recentTransactions
          .filter(tx => tx.transactions.sign === 'in' && tx.transactions.purpose === 'salary')
          .reduce((sum, tx) => sum + tx.transactions.amount, 0)
      }
    };
    
    // RAG APIに送信するプロンプトを構築
    const prompt = `
以下のユーザーの推し活データを分析し、推し活タイプの判定と改善提案を行ってください。

## ユーザーデータ
### 推し活安心度スコア
- 総合スコア: ${analysisData.score.total}点/100点
- 評価レベル: ${analysisData.score.label}
- 収入比率スコア: ${analysisData.score.breakdown.incomeRatioScore || 0}点/40点
- 余剰金スコア: ${analysisData.score.breakdown.surplusScore || 0}点/30点
- 推奨額適合スコア: ${analysisData.score.breakdown.recommendedAmountScore || 0}点/30点

### 口座残高
- 総残高: ¥${analysisData.accounts.totalBalance.toLocaleString()}
- 生活口座: ¥${(analysisData.accounts.life?.balanceCached || 0).toLocaleString()}
- 推し活口座: ¥${(analysisData.accounts.oshi?.balanceCached || 0).toLocaleString()}

### 直近3ヶ月の支出サマリー
- 推し活支出: ¥${analysisData.summary.oshiExpenses.toLocaleString()}
- 生活支出: ¥${analysisData.summary.lifeExpenses.toLocaleString()}
- 収入: ¥${analysisData.summary.income.toLocaleString()}
- 取引回数: ${analysisData.summary.totalTransactions}回

### 取引パターン
${analysisData.transactions.slice(0, 10).map(tx => 
  `- ${tx.date}: ${tx.sign === 'out' ? '-' : '+'}¥${tx.amount.toLocaleString()} (${tx.purpose}) [${tx.accountType}口座]`
).join('\n')}

## 分析要求
1. 推し活タイプを判定してください（健全/安定/注意/危険）
2. 3ヶ月間の支出傾向を分析してください
3. リスク要因があれば指摘してください
4. 具体的な改善提案を3つ以内で提示してください
5. 応援メッセージを含めてください

回答は日本語で、親しみやすく前向きな表現でお願いします。
    `;
    
    // RAG APIを呼び出し
    const ragResponse = await fetch('https://api.tsk-pf.com/api/v1/project/f2245dc6-1280-4b71-a9aa-a0a24668e12d/ragchat', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': 'RHFricAqCqnSFIp8mbmeaR0Snr4JryCb2x-VRSrVeyg59E1hNFWz3o26aqlOFywDIgMGhDtqHdZ94fzX6Es4bt-tdYWXXdESisjcDk-nhMIsulbUyfjPFAc4w5F-JaQT',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: prompt }
        ],
        stream: false,
        max_completion_tokens: 1024,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0
      })
    });
    
    if (!ragResponse.ok) {
      throw new Error(`RAG API error: ${ragResponse.status}`);
    }
    
    const ragResult = await ragResponse.json() as any;
    
    return c.json({
      success: true,
      analysis: ragResult.choices?.[0]?.message?.content || 'Analysis not available',
      data: analysisData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('RAG analysis error:', error);
    return c.json({ 
      success: false,
      error: 'Failed to perform RAG analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { analysisRoute }; 