import { Hono } from 'hono';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { transactions, accounts } from '@oshieru/db/src/schema';
import { authMiddleware } from '../middleware/auth';
// 口座残高を再計算・更新するヘルパー関数
async function updateAccountBalance(db, accountId) {
    // その口座の全取引を取得
    const accountTransactions = await db.select({
        amount: transactions.amount,
        sign: transactions.sign,
    })
        .from(transactions)
        .where(eq(transactions.accountId, accountId));
    // 残高を計算
    const calculatedBalance = accountTransactions.reduce((balance, tx) => {
        return balance + (tx.sign === 'in' ? tx.amount : -tx.amount);
    }, 0);
    // 残高を更新
    await db.update(accounts)
        .set({ balanceCached: calculatedBalance })
        .where(eq(accounts.id, accountId));
    console.log(`Updated balance for account ${accountId}: ${calculatedBalance}`);
    return calculatedBalance;
}
const transactionsRoute = new Hono();
transactionsRoute.use('*', authMiddleware);
// 取引の一括更新
// 新しい一括更新エンドポイント（詳細な更新情報対応）
transactionsRoute.put('/batch-update', async (c) => {
    const userId = c.get('userId');
    const db = c.get('db');
    try {
        const body = await c.req.json();
        const { updates } = body;
        if (!updates || !Array.isArray(updates)) {
            return c.json({ error: 'Invalid request data' }, 400);
        }
        console.log('Batch updating transactions with details:', { updates, userId });
        const affectedAccountIds = new Set();
        // 各取引を個別に更新
        for (const update of updates) {
            const { id, purpose, accountKind, accountId, isPending } = update;
            const result = await db.update(transactions)
                .set({
                purpose: purpose,
                accountId: accountId,
                isPending: isPending || false,
                canEdit: true
            })
                .where(eq(transactions.id, id))
                .returning();
            if (result.length > 0) {
                affectedAccountIds.add(accountId);
                // 元の口座IDも追加（口座変更の場合）
                if (result[0].accountId && result[0].accountId !== accountId) {
                    affectedAccountIds.add(result[0].accountId);
                }
            }
        }
        // 関連する口座の残高を再計算・更新
        for (const accountId of affectedAccountIds) {
            await updateAccountBalance(db, accountId);
        }
        return c.json({
            success: true,
            updatedCount: updates.length,
            message: `${updates.length} transactions updated successfully`
        });
    }
    catch (error) {
        console.error('Batch update error:', error);
        return c.json({
            success: false,
            error: 'Failed to update transactions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
// 既存の一括更新エンドポイント（後方互換性のため保持）
transactionsRoute.patch('/batch-update', async (c) => {
    const userId = c.get('userId');
    const db = c.get('db');
    try {
        const body = await c.req.json();
        const { transactionIds, purpose } = body;
        if (!transactionIds || !Array.isArray(transactionIds) || !purpose) {
            return c.json({ error: 'Invalid request data' }, 400);
        }
        console.log('Batch updating transactions:', { transactionIds, purpose, userId });
        // 取引を一括更新
        const result = await db.update(transactions)
            .set({
            purpose: purpose,
            isPending: false,
            canEdit: true
        })
            .where(inArray(transactions.id, transactionIds))
            .returning();
        console.log('Updated transactions:', result.length);
        // 関連する口座の残高を再計算・更新
        const affectedAccountIds = [...new Set(result.map((tx) => tx.accountId))];
        for (const accountId of affectedAccountIds) {
            await updateAccountBalance(db, accountId);
        }
        return c.json({
            success: true,
            updatedCount: result.length,
            transactions: result
        });
    }
    catch (error) {
        console.error('Transaction batch update error:', error);
        return c.json({
            error: 'Failed to update transactions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
// 取引の個別更新
transactionsRoute.patch('/:id', async (c) => {
    const userId = c.get('userId');
    const db = c.get('db');
    const transactionId = c.req.param('id');
    try {
        const body = await c.req.json();
        const { purpose, memo, accountType } = body;
        console.log('Updating transaction:', { transactionId, purpose, memo, accountType, userId });
        // accountTypeが指定されている場合、対応する口座IDを取得
        let newAccountId = undefined;
        if (accountType) {
            const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
            const targetAccount = userAccounts.find(acc => acc.kind === accountType);
            if (targetAccount) {
                newAccountId = targetAccount.id;
                console.log('Moving transaction to account:', { from: 'current', to: newAccountId, type: accountType });
            }
        }
        // 取引を更新
        const updateData = {
            purpose: purpose || undefined,
            memo: memo || undefined,
            isPending: false,
            canEdit: true
        };
        // 口座移行がある場合はaccountIdも更新
        if (newAccountId) {
            updateData.accountId = newAccountId;
        }
        const result = await db.update(transactions)
            .set(updateData)
            .where(eq(transactions.id, transactionId))
            .returning();
        if (result.length === 0) {
            return c.json({ error: 'Transaction not found' }, 404);
        }
        // 関連する口座の残高を再計算・更新
        await updateAccountBalance(db, result[0].accountId); // 更新後の口座
        // 口座移行がある場合は、元の口座の残高も再計算
        if (newAccountId) {
            // 元の口座IDは更新前に取得する必要があるため、ここでは全ユーザー口座を再計算
            const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
            for (const account of userAccounts) {
                if (account.id !== result[0].accountId) {
                    await updateAccountBalance(db, account.id);
                }
            }
            console.log('Updated balances for account transfer');
        }
        return c.json({
            success: true,
            transaction: result[0]
        });
    }
    catch (error) {
        console.error('Transaction update error:', error);
        return c.json({
            error: 'Failed to update transaction',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
// 取引一覧取得
transactionsRoute.get('/', async (c) => {
    const userId = c.get('userId');
    const db = c.get('db');
    const userTransactions = await db.select({
        id: transactions.id,
        accountId: transactions.accountId,
        amount: transactions.amount,
        sign: transactions.sign,
        purpose: transactions.purpose,
        memo: transactions.memo,
        eventAt: transactions.eventAt,
        createdAt: transactions.createdAt,
        accountName: accounts.name,
        accountKind: accounts.kind,
    })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(eq(accounts.userId, userId))
        .orderBy(desc(transactions.eventAt))
        .limit(50);
    return c.json(userTransactions);
});
// 取引作成
transactionsRoute.post('/', async (c) => {
    const userId = c.get('userId');
    const { accountId, amount, sign, purpose, memo } = await c.req.json();
    if (!accountId || !amount || !sign || !purpose) {
        return c.json({ error: 'accountId, amount, sign, and purpose are required' }, 400);
    }
    if (amount <= 0) {
        return c.json({ error: 'Amount must be positive' }, 400);
    }
    if (sign !== 'in' && sign !== 'out') {
        return c.json({ error: 'Sign must be "in" or "out"' }, 400);
    }
    const db = c.get('db');
    // 口座の所有者確認
    const account = await db.select().from(accounts)
        .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
        .get();
    if (!account) {
        return c.json({ error: 'Account not found' }, 404);
    }
    // 取引作成
    const newTransaction = await db.insert(transactions).values({
        accountId,
        amount,
        sign,
        purpose,
        memo,
        eventAt: new Date(),
    }).returning().get();
    // 口座残高更新
    const balanceChange = sign === 'in' ? amount : -amount;
    await db.update(accounts)
        .set({ balanceCached: account.balanceCached + balanceChange })
        .where(eq(accounts.id, accountId));
    return c.json(newTransaction, 201);
});
// 特定口座の取引履歴
transactionsRoute.get('/account/:accountId', async (c) => {
    const userId = c.get('userId');
    const accountId = c.req.param('accountId');
    const db = c.get('db');
    // 口座の所有者確認
    const account = await db.select().from(accounts)
        .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
        .get();
    if (!account) {
        return c.json({ error: 'Account not found' }, 404);
    }
    const accountTransactions = await db.select().from(transactions)
        .where(eq(transactions.accountId, accountId))
        .orderBy(desc(transactions.eventAt));
    return c.json(accountTransactions);
});
export { transactionsRoute as transactionRoutes };
