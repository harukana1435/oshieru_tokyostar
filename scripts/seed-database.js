#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ダミーデータを読み込み
const dummyDataPath = path.join(__dirname, '../dummy_data/processed_dummy_data.json');
const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf8'));

// SQL文を生成
function generateSeedSQL() {
  let sql = '-- Seed data for oshieru database\n\n';

  // Users
  sql += '-- Insert users\n';
  for (const [customerId, customer] of Object.entries(dummyData)) {
    const userId = `user_${customerId}`;
    const email = customer.email;
    const displayName = customer.name;
    const createdAt = Date.now();

    sql += `INSERT OR REPLACE INTO users (id, email, display_name, created_at) VALUES ('${userId}', '${email}', '${displayName}', ${createdAt});\n`;
  }

  sql += '\n-- Insert accounts\n';
  for (const [customerId, customer] of Object.entries(dummyData)) {
    const userId = `user_${customerId}`;
    const lifeAccountId = `acc_life_${customerId}`;
    const oshiAccountId = `acc_oshi_${customerId}`;
    const createdAt = Date.now();

    // 生活口座
    sql += `INSERT OR REPLACE INTO accounts (id, user_id, kind, name, balance_cached, created_at) VALUES ('${lifeAccountId}', '${userId}', 'life', '生活口座', ${customer.life_balance}, ${createdAt});\n`;
    
    // 推し活口座
    sql += `INSERT OR REPLACE INTO accounts (id, user_id, kind, name, balance_cached, created_at) VALUES ('${oshiAccountId}', '${userId}', 'oshi', '推し活口座', ${customer.oshi_balance}, ${createdAt});\n`;
  }

  sql += '\n-- Insert transactions\n';
  for (const [customerId, customer] of Object.entries(dummyData)) {
    for (const tx of customer.transactions) {
      const accountId = tx.account_type === 'life' ? `acc_life_${customerId}` : `acc_oshi_${customerId}`;
      const sign = tx.type === 'expense' ? 'out' : 'in';
      const eventAt = new Date(tx.date).getTime();
      const createdAt = Date.now();
      const memo = tx.description.replace(/'/g, "''"); // SQLエスケープ
      const originalDescription = tx.description.replace(/'/g, "''");

      sql += `INSERT OR REPLACE INTO transactions (id, account_id, amount, sign, purpose, memo, original_description, is_auto_categorized, is_pending, can_edit, original_code, event_at, created_at) VALUES ('${tx.id}', '${accountId}', ${tx.amount}, '${sign}', '${tx.purpose}', '${memo}', '${originalDescription}', ${tx.is_auto_categorized ? 1 : 0}, ${tx.is_pending ? 1 : 0}, ${tx.can_edit ? 1 : 0}, ${tx.original_code || 'NULL'}, ${eventAt}, ${createdAt});\n`;
    }
  }

  sql += '\n-- Insert rewards\n';
  const rewards = [
    {
      id: 'reward_1',
      slug: 'premium-support',
      title: 'プレミアムサポート',
      description: '推し活安心度スコア80点以上で利用可能。専任アドバイザーによる個別相談サービス。',
      minScore: 80
    },
    {
      id: 'reward_2',
      slug: 'exclusive-shop',
      title: '限定オンラインショップ',
      description: '推し活安心度スコア60点以上で利用可能。限定グッズを優先購入できます。',
      minScore: 60
    },
    {
      id: 'reward_3',
      slug: 'storage-service',
      title: '荷物預かりサービス',
      description: '推し活安心度スコア40点以上で利用可能。イベント時の荷物を無料で預かります。',
      minScore: 40
    }
  ];

  for (const reward of rewards) {
    const createdAt = Date.now();
    sql += `INSERT OR REPLACE INTO rewards (id, slug, title, description, min_score, terms_url, active, created_at) VALUES ('${reward.id}', '${reward.slug}', '${reward.title}', '${reward.description}', ${reward.minScore}, NULL, 1, ${createdAt});\n`;
  }

  sql += '\n-- Insert sample scores\n';
  for (const [customerId, customer] of Object.entries(dummyData)) {
    const userId = `user_${customerId}`;
    const scoreId = `score_${customerId}_initial`;
    const score = customerId === '10000001' ? 65 : customerId === '10000002' ? 72 : 58;
    const label = score >= 80 ? 'とても安心' : score >= 60 ? '安心' : score >= 40 ? '注意' : '危険';
    const snapshotAt = Date.now();
    const createdAt = Date.now();
    
    const factors = JSON.stringify({
      incomeRatioScore: score >= 60 ? 30 : 20,
      surplusScore: score >= 60 ? 25 : 15,
      recommendedAmountScore: score >= 60 ? 20 : 10,
      incomeRatio: customerId === '10000001' ? 15.0 : customerId === '10000002' ? 12.0 : 18.0,
      surplusRatio: customerId === '10000001' ? 0.8 : customerId === '10000002' ? 0.6 : 1.2,
      recommendedDeviation: customerId === '10000001' ? 20.0 : customerId === '10000002' ? 15.0 : 35.0
    }).replace(/'/g, "''");

    sql += `INSERT OR REPLACE INTO scores (id, user_id, score, label, snapshot_at, factors, created_at) VALUES ('${scoreId}', '${userId}', ${score}, '${label}', ${snapshotAt}, '${factors}', ${createdAt});\n`;
  }

  return sql;
}

// SQL文を生成してファイルに出力
const seedSQL = generateSeedSQL();
const outputPath = path.join(__dirname, 'seed-database.sql');
fs.writeFileSync(outputPath, seedSQL);

console.log('✅ Seed SQL generated successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log('\n🚀 To apply to remote database:');
console.log('npx wrangler d1 execute oshieru-db --remote --file=scripts/seed-database.sql'); 