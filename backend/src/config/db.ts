import mongoose from 'mongoose';

let connPromise: Promise<typeof mongoose> | null = null;
let inFlightRequests = 0;
let needsFreshConnection = false;

const getMongoUri = (): string => {
    // 1. Check process.env (populated by Node/Render via dotenv and Workers via nodejs_compat)
    if (process.env.MONGO_URI) {
        return process.env.MONGO_URI;
    }

    // 2. Check cloudflare:workers env if available
    try {
        const { env } = require('cloudflare:workers');
        if (env?.MONGO_URI) {
            return env.MONGO_URI;
        }
    } catch {
        // Not in Workers or cloudflare:workers not available
    }

    throw new Error('MONGO_URI is not set. Please set the MONGO_URI secret in Cloudflare or in .env file.');
};

// Reset promise on disconnect so future requests reconnect cleanly
mongoose.connection.on('disconnected', () => {
    connPromise = null;
});

mongoose.connection.on('error', (err) => {
    console.error('[Mongoose Connection Error]:', err.message);
    connPromise = null;
});

export const requestStarted = () => {
    inFlightRequests++;
};

export const requestFinished = () => {
    inFlightRequests = Math.max(0, inFlightRequests - 1);
    if (inFlightRequests === 0) {
        needsFreshConnection = true;
    }
};

export const connectDB = async (): Promise<typeof mongoose> => {
    // In Cloudflare Workers, when all in-flight requests complete, the isolate is frozen.
    // The underlying TCP socket to MongoDB Atlas silently dies during suspension.
    // When a new request arrives after suspension, force-close the stale socket and reconnect.
    if (needsFreshConnection && mongoose.connection.readyState !== 0) {
        needsFreshConnection = false;
        try {
            if (typeof (mongoose.connection as any).getClient === 'function') {
                const client = (mongoose.connection as any).getClient();
                if (client && typeof client.close === 'function') {
                    await client.close(true);
                }
            }
        } catch (e: any) {
            console.warn('[connectDB] Force-close old socket warning:', e?.message);
        }
        (mongoose.connection as any).readyState = 0;
        connPromise = null;
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (connPromise && mongoose.connection.readyState === 2) {
        return connPromise;
    }

    const mongoUri = getMongoUri();

    connPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 10,
        bufferCommands: false,
        autoIndex: false,
    }).catch((err: any) => {
        connPromise = null;
        throw err;
    });

    const conn = await connPromise;
    console.log(`[connectDB] MongoDB Connected: ${mongoose.connection.host}`);
    return conn;
};

export default connectDB;
