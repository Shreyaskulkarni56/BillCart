import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB, { disconnectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import saleRoutes from './routes/saleRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configure Helmet with permissive cross-origin policies for external frontend integration
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: false,
    })
);

// Allowed origins check including Vercel production and preview deployments
const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    try {
        const hostname = new URL(origin).hostname;
        if (hostname === 'bill-cart.vercel.app' || hostname === 'billcart.vercel.app') {
            return true;
        }
        if (hostname.endsWith('.vercel.app')) {
            return true;
        }
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return true;
        }
    } catch {
        // If origin cannot be parsed as a URL, allow it
    }
    return true;
};

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Safe request logging compatible with Cloudflare Workers (replaces morgan's new Function compilation)
app.use((req, res, next) => {
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

// Ensure MongoDB is connected before handling API requests and teardown cleanly when request ends
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();

        let cleanedUp = false;
        const cleanup = () => {
            if (!cleanedUp) {
                cleanedUp = true;
                disconnectDB().catch(() => {});
            }
        };

        res.on('finish', cleanup);
        res.on('close', cleanup);

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

export default app;
