const fs = require('fs');
const path = require('path');

// ダミーデータを読み込み
const dummyDataPath = path.join(__dirname, '../dummy_data/processed_dummy_data.json');
const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf8'));

// 残高を再計算してSQL文を生成
function generateBalanceUpdateSQL() {
  let sql = '-- Recalculate account balances from transaction history\n\n';

  for (const [customerId, customer] of Object.entries(dummyData)) {
    // 生活口座の残高計算
    let lifeBalance = 0;
    let oshiBalance = 0;

    for (const tx of customer.transactions) {
      const amount = tx.type === 'expense' ? -tx.amount : tx.amount;
      
      if (tx.account_type === 'life') {
        lifeBalance += amount;
      } else {
        oshiBalance += amount;
      }
    }

    const lifeAccountId = `acc_life_${customerId}`;
    const oshiAccountId = `acc_oshi_${customerId}`;

    sql += `-- Customer ${customerId} (${customer.name})\n`;
    sql += `UPDATE accounts SET balance_cached = ${lifeBalance} WHERE id = '${lifeAccountId}';\n`;
    sql += `UPDATE accounts SET balance_cached = ${oshiBalance} WHERE id = '${oshiAccountId}';\n\n`;

    console.log(`Customer ${customerId}: Life=${lifeBalance}, Oshi=${oshiBalance}`);
  }

  return sql;
}

// SQL文を生成してファイルに出力
const balanceSQL = generateBalanceUpdateSQL();
const outputPath = path.join(__dirname, 'recalculate-balances.sql');
fs.writeFileSync(outputPath, balanceSQL);

console.log('✅ Balance recalculation SQL generated successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log('\n🚀 To apply to remote database:');
console.log('npx wrangler d1 execute oshieru-db --remote --file=scripts/recalculate-balances.sql'); 
const path = require('path');

// ダミーデータを読み込み
const dummyDataPath = path.join(__dirname, '../dummy_data/processed_dummy_data.json');
const dummyData = JSON.parse(fs.readFileSync(dummyDataPath, 'utf8'));

// 残高を再計算してSQL文を生成
function generateBalanceUpdateSQL() {
  let sql = '-- Recalculate account balances from transaction history\n\n';

  for (const [customerId, customer] of Object.entries(dummyData)) {
    // 生活口座の残高計算
    let lifeBalance = 0;
    let oshiBalance = 0;

    for (const tx of customer.transactions) {
      const amount = tx.type === 'expense' ? -tx.amount : tx.amount;
      
      if (tx.account_type === 'life') {
        lifeBalance += amount;
      } else {
        oshiBalance += amount;
      }
    }

    const lifeAccountId = `acc_life_${customerId}`;
    const oshiAccountId = `acc_oshi_${customerId}`;

    sql += `-- Customer ${customerId} (${customer.name})\n`;
    sql += `UPDATE accounts SET balance_cached = ${lifeBalance} WHERE id = '${lifeAccountId}';\n`;
    sql += `UPDATE accounts SET balance_cached = ${oshiBalance} WHERE id = '${oshiAccountId}';\n\n`;

    console.log(`Customer ${customerId}: Life=${lifeBalance}, Oshi=${oshiBalance}`);
  }

  return sql;
}

// SQL文を生成してファイルに出力
const balanceSQL = generateBalanceUpdateSQL();
const outputPath = path.join(__dirname, 'recalculate-balances.sql');
fs.writeFileSync(outputPath, balanceSQL);

console.log('✅ Balance recalculation SQL generated successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log('\n🚀 To apply to remote database:');
console.log('npx wrangler d1 execute oshieru-db --remote --file=scripts/recalculate-balances.sql'); 