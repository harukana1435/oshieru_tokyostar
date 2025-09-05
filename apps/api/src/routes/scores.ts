import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { scores } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

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

// スコア計算要求
scoresRoute.post('/calculate', async (c) => {
  const userId = c.get('userId');
  const { income, oshiExpense, essentialExpense } = await c.req.json();
  
  if (!income || income <= 0) {
    return c.json({ error: 'Valid income is required' }, 400);
  }
  
  try {
    // Score Worker を呼び出し
    const scoreResponse = await c.env.SCORE_WORKER.fetch('https://score-worker/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
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
    console.error('Score calculation error:', error);
    return c.json({ error: 'Failed to calculate score' }, 500);
  }
});

export { scoresRoute as scoreRoutes }; 