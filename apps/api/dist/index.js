import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@oshieru/db/src/schema';
import { authRoutes } from './routes/auth';
import { accountRoutes } from './routes/accounts';
import { transactionRoutes } from './routes/transactions';
import { scoreRoutes } from './routes/scores';
import { rewardRoutes } from './routes/rewards';
import { dashboardRoutes } from './routes/dashboard';
import { analysisRoutes } from './routes/analysis';
const app = new Hono();
// Middleware
app.use('*', cors());
app.use('*', prettyJSON());
// Database middleware
app.use('*', async (c, next) => {
    const db = drizzle(c.env.DB, { schema });
    c.set('db', db);
    await next();
});
// Health check
app.get('/', (c) => {
    return c.json({
        message: 'Oshieru API is running',
        version: '0.1.0',
        timestamp: new Date().toISOString()
    });
});
// Routes
app.route('/auth', authRoutes);
app.route('/accounts', accountRoutes);
app.route('/transactions', transactionRoutes);
app.route('/scores', scoreRoutes);
app.route('/rewards', rewardRoutes);
app.route('/dashboard', dashboardRoutes);
app.route('/analysis', analysisRoutes);
// Error handling
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({
        error: 'Internal Server Error',
        message: err.message
    }, 500);
});
// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});
export default app;
