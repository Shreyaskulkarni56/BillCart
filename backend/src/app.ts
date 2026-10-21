import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB, { requestStarted, requestFinished } from './config/db';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import saleRoutes from './routes/saleRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();

// 1. Guaranteed Universal CORS headers & instant OPTIONS preflight handler
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// Configure Helmet with permissive cross-origin policies for external frontend integration
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: false,
    })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Safe request logging & isolate lifecycle tracking compatible with Cloudflare Workers
app.use((req, res, next) => {
    requestStarted();
    let ended = false;
    const onEnd = () => {
        if (!ended) {
            ended = true;
            requestFinished();
        }
    };
    res.on('finish', onEnd);
    res.on('close', onEnd);

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Root endpoint for health check
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Ensure MongoDB is connected before handling API requests
app.use('/api', async (req, res, next) => {
    console.log('[api-middleware]', req.method, req.originalUrl, 'entering connectDB');
    try {
        await connectDB();
        console.log('[api-middleware]', req.method, req.originalUrl, 'connectDB done, calling next()');
        next();
    } catch (err: any) {
        console.error('Database connection error in request middleware:', err);
        return res.status(500).json({
            message: 'Database connection failed',
            error: err?.message || 'Unable to connect to MongoDB Atlas'
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/settings', settingsRoutes);

// Global error handler ensuring CORS headers are always retained
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(err.status || 500).json({
        message: err.message || 'Server Error'
    });
});

export default app;
