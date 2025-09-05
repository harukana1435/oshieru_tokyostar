import { drizzle } from 'drizzle-orm/d1';
import { users, accounts, transactions, rewards, scores } from './src/schema';
import * as fs from 'fs';
import * as path from 'path';

// 実際のダミーデータを読み込み
const dummyDataPath = path.join(__dirname, 'processed_dummy_data.json');
const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf-8'));

// データ変換関数
function convertDummyData() {
  const users: any[] = [];
  const accounts: any[] = [];
  const transactions: any[] = [];
  
  for (const [customerId, customerData] of Object.entries(dummyData as any)) {
    const userId = `user_${customerId}`;
    const data = customerData as any;
    
    // ユーザー作成
    users.push({
      id: userId,
      email: data.email,
      displayName: data.name,
    });
    
    // 口座作成（生活口座）
    const lifeAccountId = `acc_life_${customerId}`;
    accounts.push({
      id: lifeAccountId,
      userId: userId,
      kind: 'life' as const,
      name: '生活口座',
      balanceCached: data.life_balance,
    });
    
    // 口座作成（推し活口座）
    const oshiAccountId = `acc_oshi_${customerId}`;
    accounts.push({
      id: oshiAccountId,
      userId: userId,
      kind: 'oshi' as const,
      name: '推し活口座',
      balanceCached: data.oshi_balance,
    });
    
    // 取引データ変換
    data.transactions.forEach((tx: any, index: number) => {
      const accountId = tx.account_type === 'oshi' ? oshiAccountId : lifeAccountId;
      
      transactions.push({
        id: `tx_${customerId}_${index}`,
        accountId: accountId,
        amount: tx.amount,
        sign: tx.type === 'income' ? 'in' as const : 'out' as const,
        purpose: tx.purpose as any,
        memo: tx.description,
        originalDescription: tx.description,
        isAutoCategorized: tx.is_auto_categorized,
        isPending: tx.is_pending,
        canEdit: tx.can_edit,
        originalCode: tx.original_code,
        eventAt: new Date(tx.date),
      });
    });
  }
  
  return { users, accounts, transactions };
}

// 特典データ
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

export async function seedDatabase(db: any) {
  console.log('Seeding database with real dummy data...');
  
  try {
    const { users: realUsers, accounts: realAccounts, transactions: realTransactions } = convertDummyData();
    
    // ユーザー作成
    await db.insert(users).values(realUsers);
    console.log(`✓ ${realUsers.length} Users seeded`);
    
    // 口座作成
    await db.insert(accounts).values(realAccounts);
    console.log(`✓ ${realAccounts.length} Accounts seeded`);
    
    // 取引作成
    for (let i = 0; i < realTransactions.length; i += 50) {
      const batch = realTransactions.slice(i, i + 50);
      await db.insert(transactions).values(batch);
      console.log(`✓ Transactions batch ${Math.floor(i/50) + 1} seeded (${batch.length} records)`);
    }
    
    // 特典作成
    await db.insert(rewards).values(sampleRewards);
    console.log('✓ Rewards seeded');
    
    // サンプルスコア作成（各顧客に1つずつ）
    const sampleScores = realUsers.map((user, index) => ({
      id: `score_${user.id}`,
      userId: user.id,
      score: 60 + (index * 10), // 60, 70, 80点で差をつける
      label: index === 0 ? '安心' : index === 1 ? '安心' : 'とても安心',
      snapshotAt: new Date('2024-07-31'),
      factors: JSON.stringify({
        incomeRatioScore: 30 + (index * 5),
        surplusScore: 20 + (index * 5),
        recommendedAmountScore: 10 + (index * 5),
        incomeRatio: 15.0 + (index * 2),
        surplusRatio: 0.8 + (index * 0.1),
        recommendedDeviation: 20.0 - (index * 5),
      }),
    }));
    
    await db.insert(scores).values(sampleScores);
    console.log('✓ Sample scores seeded');
    
    console.log('Database seeding completed successfully!');
    console.log(`Total: ${realUsers.length} users, ${realAccounts.length} accounts, ${realTransactions.length} transactions`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 