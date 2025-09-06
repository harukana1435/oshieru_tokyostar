-- 残高修正SQL
UPDATE accounts SET balance_cached = 36288 WHERE id = 'acc_life_10000001';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000001';
UPDATE accounts SET balance_cached = 371957 WHERE id = 'acc_life_10000002';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000002';
UPDATE accounts SET balance_cached = 520564 WHERE id = 'acc_life_10000003';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000003';

-- 更新後の残高確認
SELECT id, name, kind, balance_cached, user_id FROM accounts ORDER BY user_id, kind;
