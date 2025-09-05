import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { rewards, userRewards } from '@oshieru/db/src/schema';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';

const rewardsRoute = new Hono<Env>();

rewardsRoute.use('*', authMiddleware);

// 利用可能な特典一覧
rewardsRoute.get('/', async (c) => {
  const db = c.get('db');
  
  const activeRewards = await db.select().from(rewards)
    .where(eq(rewards.active, true));
  
  return c.json(activeRewards);
});

// ユーザーの特典状況
rewardsRoute.get('/my', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  
  const myRewards = await db.select({
    id: userRewards.id,
    status: userRewards.status,
    updatedAt: userRewards.updatedAt,
    rewardId: rewards.id,
    slug: rewards.slug,
    title: rewards.title,
    description: rewards.description,
    minScore: rewards.minScore,
    termsUrl: rewards.termsUrl,
  })
  .from(userRewards)
  .leftJoin(rewards, eq(userRewards.rewardId, rewards.id))
  .where(eq(userRewards.userId, userId));
  
  return c.json(myRewards);
});

// 特典交換
rewardsRoute.post('/:rewardId/redeem', async (c) => {
  const userId = c.get('userId');
  const rewardId = c.req.param('rewardId');
  const db = c.get('db');
  
  // 特典の存在確認
  const reward = await db.select().from(rewards)
    .where(and(eq(rewards.id, rewardId), eq(rewards.active, true)))
    .get();
  
  if (!reward) {
    return c.json({ error: 'Reward not found' }, 404);
  }
  
  // 既存の特典状況確認
  const existingUserReward = await db.select().from(userRewards)
    .where(and(eq(userRewards.userId, userId), eq(userRewards.rewardId, rewardId)))
    .get();
  
  if (existingUserReward) {
    if (existingUserReward.status === 'redeemed') {
      return c.json({ error: 'Reward already redeemed' }, 400);
    }
    
    // ステータスを更新
    const updatedUserReward = await db.update(userRewards)
      .set({ status: 'redeemed', updatedAt: new Date() })
      .where(eq(userRewards.id, existingUserReward.id))
      .returning()
      .get();
    
    return c.json(updatedUserReward);
  } else {
    // 新規作成（本来はスコアチェックが必要）
    const newUserReward = await db.insert(userRewards).values({
      userId,
      rewardId,
      status: 'redeemed',
    }).returning().get();
    
    return c.json(newUserReward, 201);
  }
});

export { rewardsRoute as rewardRoutes }; 