-- Recalculate account balances from transaction history

-- Customer 10000001 (顧客1)
UPDATE accounts SET balance_cached = 36288 WHERE id = 'acc_life_10000001';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000001';

-- Customer 10000002 (顧客2)
UPDATE accounts SET balance_cached = 371957 WHERE id = 'acc_life_10000002';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000002';

-- Customer 10000003 (顧客3)
UPDATE accounts SET balance_cached = 520564 WHERE id = 'acc_life_10000003';
UPDATE accounts SET balance_cached = 0 WHERE id = 'acc_oshi_10000003';

