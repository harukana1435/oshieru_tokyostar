import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '@oshieru/db/src/schema';
const auth = new Hono();
// 簡易ログイン（プロトタイプ用）
auth.post('/login', async (c) => {
    const { email } = await c.req.json();
    if (!email) {
        return c.json({ error: 'Email is required' }, 400);
    }
    const db = c.get('db');
    // ユーザーを検索、存在しなければ作成
    let user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
        const newUser = await db.insert(users).values({
            email,
            displayName: email.split('@')[0], // メールアドレスの@より前を表示名に
        }).returning().get();
        user = newUser;
    }
    // セッション情報をKVに保存（簡易実装）
    const sessionId = crypto.randomUUID();
    await c.env.KV.put(`session:${sessionId}`, JSON.stringify({
        userId: user.id,
        email: user.email
    }), { expirationTtl: 86400 * 7 }); // 7日間
    return c.json({
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        },
        sessionId
    });
});
// セッション検証
auth.get('/me', async (c) => {
    const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!sessionId) {
        return c.json({ error: 'Authorization header required' }, 401);
    }
    const sessionData = await c.env.KV.get(`session:${sessionId}`);
    if (!sessionData) {
        return c.json({ error: 'Invalid session' }, 401);
    }
    const session = JSON.parse(sessionData);
    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
    });
});
// デモログイン（プロトタイプ用）
auth.post('/demo-login', async (c) => {
    const { email } = await c.req.json();
    if (!email) {
        return c.json({
            success: false,
            error: 'Email is required'
        }, 400);
    }
    const db = c.get('db');
    // ユーザーを検索
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
        return c.json({
            success: false,
            error: 'User not found'
        }, 404);
    }
    // デモセッション情報をKVに保存
    const sessionId = `demo-session-${Date.now()}`;
    await c.env.KV.put(`session:${sessionId}`, JSON.stringify({
        userId: user.id,
        email: user.email
    }), { expirationTtl: 86400 * 7 }); // 7日間
    return c.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt,
        },
        sessionId
    });
});
// ログアウト
auth.post('/logout', async (c) => {
    const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');
    if (sessionId) {
        await c.env.KV.delete(`session:${sessionId}`);
    }
    return c.json({ message: 'Logged out successfully' });
});
export { auth as authRoutes };
