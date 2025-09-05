import { drizzle } from 'drizzle-orm/d1';
import { users, accounts, transactions, rewards, scores } from './src/schema';

// サンプルデータ
const sampleUsers = [
  {
    id: 'user_demo',
    email: 'demo@oshieru.com',
    displayName: '推し活太郎',
  },
];

const sampleAccounts = [
  {
    id: 'acc_life_demo',
    userId: 'user_demo',
    kind: 'life' as const,
    name: '生活口座',
    balanceCached: 250000,
  },
  {
    id: 'acc_oshi_demo',
    userId: 'user_demo',
    kind: 'oshi' as const,
    name: '推し活口座',
    balanceCached: 45000,
  },
];

const sampleTransactions = [
  // 収入
  {
    id: 'tx_salary_1',
    accountId: 'acc_life_demo',
    amount: 300000,
    sign: 'in' as const,
    purpose: 'salary' as const,
    memo: '1月分給与',
    eventAt: new Date('2024-01-25'),
  },
  // 推し活口座への振替
  {
    id: 'tx_transfer_1',
    accountId: 'acc_life_demo',
    amount: 50000,
    sign: 'out' as const,
    purpose: 'other' as const,
    memo: '推し活口座への振替',
    eventAt: new Date('2024-01-26'),
  },
  {
    id: 'tx_transfer_2',
    accountId: 'acc_oshi_demo',
    amount: 50000,
    sign: 'in' as const,
    purpose: 'other' as const,
    memo: '生活口座からの振替',
    eventAt: new Date('2024-01-26'),
  },
  // 推し活支出
  {
    id: 'tx_ticket_1',
    accountId: 'acc_oshi_demo',
    amount: 8000,
    sign: 'out' as const,
    purpose: 'ticket' as const,
    memo: 'ライブチケット',
    eventAt: new Date('2024-01-28'),
  },
  {
    id: 'tx_goods_1',
    accountId: 'acc_oshi_demo',
    amount: 3500,
    sign: 'out' as const,
    purpose: 'goods' as const,
    memo: 'グッズ購入',
    eventAt: new Date('2024-01-30'),
  },
  // 生活費
  {
    id: 'tx_rent_1',
    accountId: 'acc_life_demo',
    amount: 80000,
    sign: 'out' as const,
    purpose: 'rent' as const,
    memo: '家賃',
    eventAt: new Date('2024-01-27'),
  },
  {
    id: 'tx_food_1',
    accountId: 'acc_life_demo',
    amount: 40000,
    sign: 'out' as const,
    purpose: 'food' as const,
    memo: '食費',
    eventAt: new Date('2024-01-31'),
  },
];

const sampleRewards = [
  {
    id: 'reward_1',
    slug: 'gold-member',
    title: 'ゴールド会員',
    description: '推し活安心度スコア80点以上で利用可能。手数料無料や優先サポートが受けられます。',
    minScore: 80,
    active: true,
  },
  {
    id: 'reward_2',
    slug: 'exclusive-shop',
    title: '限定オンラインショップ',
    description: '推し活安心度スコア60点以上で利用可能。限定グッズを優先購入できます。',
    minScore: 60,
    active: true,
  },
  {
    id: 'reward_3',
    slug: 'storage-service',
    title: '荷物預かりサービス',
    description: '推し活安心度スコア40点以上で利用可能。イベント時の荷物を無料で預かります。',
    minScore: 40,
    active: true,
  },
  {
    id: 'reward_4',
    slug: 'low-interest-loan',
    title: '低金利ローン',
    description: '推し活安心度スコア70点以上で利用可能。高額グッズの分割払いが優遇金利で利用できます。',
    minScore: 70,
    active: true,
  },
];

const sampleScores = [
  {
    id: 'score_1',
    userId: 'user_demo',
    score: 75,
    label: '安心',
    snapshotAt: new Date('2024-02-01'),
    factors: JSON.stringify({
      incomeRatioScore: 30,
      surplusScore: 25,
      recommendedAmountScore: 20,
      incomeRatio: 16.67,
      surplusRatio: 0.83,
      recommendedDeviation: 25.0,
    }),
  },
];

export async function seedDatabase(db: any) {
  console.log('Seeding database...');
  
  try {
    // ユーザー作成
    await db.insert(users).values(sampleUsers);
    console.log('✓ Users seeded');
    
    // 口座作成
    await db.insert(accounts).values(sampleAccounts);
    console.log('✓ Accounts seeded');
    
    // 取引作成
    await db.insert(transactions).values(sampleTransactions);
    console.log('✓ Transactions seeded');
    
    // 特典作成
    await db.insert(rewards).values(sampleRewards);
    console.log('✓ Rewards seeded');
    
    // スコア作成
    await db.insert(scores).values(sampleScores);
    console.log('✓ Scores seeded');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 