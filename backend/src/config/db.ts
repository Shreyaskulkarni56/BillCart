import mongoose from 'mongoose';

let activeRequests = 0;
let connPromise: Promise<typeof mongoose> | null = null;

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

export const connectDB = async (): Promise<typeof mongoose> => {
    activeRequests++;

    if (mongoose.connection && mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (mongoose.connection && mongoose.connection.readyState === 2 && connPromise) {
        return connPromise;
    }

    const mongoUri = getMongoUri();

    connPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    }).catch((err: any) => {
        connPromise = null;
        throw err;
    });

    const conn = await connPromise;
    console.log(`[connectDB] MongoDB Connected: ${mongoose.connection.host}`);
    return conn;
};

export const disconnectDB = async (): Promise<void> => {
    activeRequests = Math.max(0, activeRequests - 1);

    // In Cloudflare Workers, isolates freeze when idle, causing lingering sockets to die.
    // Disconnecting when active requests reach 0 ensures clean socket teardown between requests.
    if (activeRequests === 0 && mongoose.connection && mongoose.connection.readyState !== 0) {
        try {
            await mongoose.disconnect();
            connPromise = null;
        } catch (err: any) {
            console.error('[disconnectDB] Error disconnecting:', err.message);
        }
    }
};

export default connectDB;
