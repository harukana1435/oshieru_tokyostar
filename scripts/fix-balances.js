const fs = require('fs');

// 各口座の取引を集計して正しい残高を計算
function calculateCorrectBalances() {
  // 処理済みダミーデータを読み込み
  const processedData = JSON.parse(fs.readFileSync('dummy_data/processed_dummy_data.json', 'utf8'));
  
  const balanceUpdates = [];
  
  // 各顧客の取引を処理
  Object.keys(processedData).forEach(customerId => {
    const customerData = processedData[customerId];
    const userId = `user_${customerId}`;
    
    // 生活口座の残高計算
    let lifeBalance = 0;
    let oshiBalance = 0;
    
    customerData.transactions.forEach(tx => {
      const amount = tx.amount;
      const isIncome = tx.type === 'income'; // income = 入金, expense = 出金
      const balanceChange = isIncome ? amount : -amount;
      
      // 全ての取引は生活口座に記録（推し活口座への振替は別途処理）
      lifeBalance += balanceChange;
    });
    
    balanceUpdates.push({
      accountId: `acc_life_${customerId}`,
      balance: lifeBalance,
      userId,
      customerName: customerData.name
    });
    
    balanceUpdates.push({
      accountId: `acc_oshi_${customerId}`,
      balance: oshiBalance, // 推し活口座は0円でスタート
      userId,
      customerName: customerData.name
    });
  });
  
  return balanceUpdates;
}

// SQLコマンドを生成
function generateBalanceUpdateSQL() {
  const updates = calculateCorrectBalances();
  
  let sql = '-- 残高修正SQL\n';
  
  updates.forEach(update => {
    sql += `UPDATE accounts SET balance_cached = ${update.balance} WHERE id = '${update.accountId}';\n`;
  });
  
  // 実際の残高を表示
  sql += '\n-- 更新後の残高確認\n';
  sql += 'SELECT id, name, kind, balance_cached, user_id FROM accounts ORDER BY user_id, kind;\n';
  
  return sql;
}

// 実際の残高を計算して表示
function displayCalculatedBalances() {
  const updates = calculateCorrectBalances();
  
  console.log('=== 取引履歴から計算した正しい残高 ===');
  updates.forEach(update => {
    const accountType = update.accountId.includes('_life_') ? '生活口座' : '推し活口座';
    console.log(`${update.customerName} ${accountType} (${update.accountId}): ${update.balance.toLocaleString()}円`);
  });
  
  return updates;
}

// SQLファイルを生成
const sql = generateBalanceUpdateSQL();
fs.writeFileSync('fix-balances.sql', sql, 'utf8');

console.log('残高修正SQLを生成しました: fix-balances.sql');
displayCalculatedBalances(); 