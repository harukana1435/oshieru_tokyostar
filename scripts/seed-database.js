#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 実際のダミーデータを読み込み
const dummyDataPath = path.join(__dirname, '../packages/db/processed_dummy_data.json');
const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf-8'));

console.log('🌱 Starting database seeding with real dummy data...');

// データ変換関数
function convertDummyData() {
  const users = [];
  const accounts = [];
  const transactions = [];
  
  for (const [customerId, customerData] of Object.entries(dummyData)) {
    const userId = `user_${customerId}`;
    const data = customerData;
    
    // ユーザー作成
    users.push({
      id: userId,
      email: data.email,
      displayName: data.name,
      createdAt: new Date().getTime(),
    });
    
    // 口座作成（生活口座）
    const lifeAccountId = `acc_life_${customerId}`;
    accounts.push({
      id: lifeAccountId,
      userId: userId,
      kind: 'life',
      name: '生活口座',
      balanceCached: data.life_balance,
      createdAt: new Date().getTime(),
    });
    
    // 口座作成（推し活口座）
    const oshiAccountId = `acc_oshi_${customerId}`;
    accounts.push({
      id: oshiAccountId,
      userId: userId,
      kind: 'oshi',
      name: '推し活口座',
      balanceCached: data.oshi_balance,
      createdAt: new Date().getTime(),
    });
    
    // 取引データ変換
    data.transactions.forEach((tx, index) => {
      const accountId = tx.account_type === 'oshi' ? oshiAccountId : lifeAccountId;
      
      transactions.push({
        id: `tx_${customerId}_${index}`,
        accountId: accountId,
        amount: tx.amount,
        sign: tx.type === 'income' ? 'in' : 'out',
        purpose: tx.purpose,
        memo: tx.description,
        originalDescription: tx.description,
        isAutoCategorized: tx.is_auto_categorized ? 1 : 0,
        isPending: tx.is_pending ? 1 : 0,
        canEdit: tx.can_edit ? 1 : 0,
        originalCode: tx.original_code || null,
        eventAt: new Date(tx.date).getTime(),
        createdAt: new Date().getTime(),
      });
    });
  }
  
  return { users, accounts, transactions };
}

// 特典データ
const rewards = [
  {
    id: 'reward_1',
    slug: 'gold-member',
    title: 'ゴールド会員',
    description: '推し活安心度スコア80点以上で利用可能。手数料無料や優先サポートが受けられます。',
    minScore: 80,
    termsUrl: null,
    active: 1,
    createdAt: new Date().getTime(),
  },
  {
    id: 'reward_2',
    slug: 'exclusive-shop',
    title: '限定オンラインショップ',
    description: '推し活安心度スコア60点以上で利用可能。限定グッズを優先購入できます。',
    minScore: 60,
    termsUrl: null,
    active: 1,
    createdAt: new Date().getTime(),
  },
  {
    id: 'reward_3',
    slug: 'storage-service',
    title: '荷物預かりサービス',
    description: '推し活安心度スコア40点以上で利用可能。イベント時の荷物を無料で預かります。',
    minScore: 40,
    termsUrl: null,
    active: 1,
    createdAt: new Date().getTime(),
  },
  {
    id: 'reward_4',
    slug: 'low-interest-loan',
    title: '低金利ローン',
    description: '推し活安心度スコア70点以上で利用可能。高額グッズの分割払いが優遇金利で利用できます。',
    minScore: 70,
    termsUrl: null,
    active: 1,
    createdAt: new Date().getTime(),
  },
];

async function seedDatabase() {
  try {
    const { users, accounts, transactions } = convertDummyData();
    
    console.log('📝 Generating SQL statements...');
    
    // ユーザー挿入SQL
    const userInserts = users.map(user => 
      `INSERT INTO users (id, email, display_name, created_at) VALUES ('${user.id}', '${user.email}', '${user.displayName}', ${user.createdAt});`
    ).join('\n');
    
    // 口座挿入SQL
    const accountInserts = accounts.map(account => 
      `INSERT INTO accounts (id, user_id, kind, name, balance_cached, created_at) VALUES ('${account.id}', '${account.userId}', '${account.kind}', '${account.name}', ${account.balanceCached}, ${account.createdAt});`
    ).join('\n');
    
    // 取引挿入SQL（バッチ処理）
    const transactionInserts = transactions.map(tx => 
      `INSERT INTO transactions (id, account_id, amount, sign, purpose, memo, original_description, is_auto_categorized, is_pending, can_edit, original_code, event_at, created_at) VALUES ('${tx.id}', '${tx.accountId}', ${tx.amount}, '${tx.sign}', '${tx.purpose}', '${tx.memo.replace(/'/g, "''")}', '${tx.originalDescription.replace(/'/g, "''")}', ${tx.isAutoCategorized}, ${tx.isPending}, ${tx.canEdit}, ${tx.originalCode}, ${tx.eventAt}, ${tx.createdAt});`
    ).join('\n');
    
    // 特典挿入SQL
    const rewardInserts = rewards.map(reward => 
      `INSERT INTO rewards (id, slug, title, description, min_score, terms_url, active, created_at) VALUES ('${reward.id}', '${reward.slug}', '${reward.title}', '${reward.description.replace(/'/g, "''")}', ${reward.minScore}, ${reward.termsUrl}, ${reward.active}, ${reward.createdAt});`
    ).join('\n');
    
    // サンプルスコア挿入SQL
    const scoreInserts = users.map((user, index) => {
      const score = 60 + (index * 10);
      const label = index === 0 ? '安心' : index === 1 ? '安心' : 'とても安心';
      const factors = JSON.stringify({
        incomeRatioScore: 30 + (index * 5),
        surplusScore: 20 + (index * 5),
        recommendedAmountScore: 10 + (index * 5),
        incomeRatio: 15.0 + (index * 2),
        surplusRatio: 0.8 + (index * 0.1),
        recommendedDeviation: 20.0 - (index * 5),
      });
      
      return `INSERT INTO scores (id, user_id, score, label, snapshot_at, factors, created_at) VALUES ('score_${user.id}', '${user.id}', ${score}, '${label}', ${new Date('2024-07-31').getTime()}, '${factors.replace(/'/g, "''")}', ${new Date().getTime()});`;
    }).join('\n');
    
    // 全SQLを結合
    const allSQL = [
      '-- Users',
      userInserts,
      '',
      '-- Accounts', 
      accountInserts,
      '',
      '-- Transactions',
      transactionInserts,
      '',
      '-- Rewards',
      rewardInserts,
      '',
      '-- Scores',
      scoreInserts
    ].join('\n');
    
    // SQLファイルに保存
    const sqlPath = path.join(__dirname, 'seed-data.sql');
    fs.writeFileSync(sqlPath, allSQL);
    
    console.log(`✅ SQL file generated: ${sqlPath}`);
    console.log(`📊 Data summary:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${accounts.length} accounts`);
    console.log(`   - ${transactions.length} transactions`);
    console.log(`   - ${rewards.length} rewards`);
    console.log(`   - ${users.length} scores`);
    console.log('');
    console.log('🚀 To apply this data to your D1 database, run:');
    console.log('   npx wrangler d1 execute oshieru-db --file=scripts/seed-data.sql');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 