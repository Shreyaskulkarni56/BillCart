"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.requestFinished = exports.requestStarted = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let connPromise = null;
let inFlightRequests = 0;
let needsFreshConnection = false;
const getMongoUri = () => {
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
    }
    catch {
        // Not in Workers or cloudflare:workers not available
    }
    throw new Error('MONGO_URI is not set. Please set the MONGO_URI secret in Cloudflare or in .env file.');
};
// Reset promise on disconnect so future requests reconnect cleanly
mongoose_1.default.connection.on('disconnected', () => {
    connPromise = null;
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('[Mongoose Connection Error]:', err.message);
    connPromise = null;
});
const requestStarted = () => {
    inFlightRequests++;
};
exports.requestStarted = requestStarted;
const requestFinished = () => {
    inFlightRequests = Math.max(0, inFlightRequests - 1);
    if (inFlightRequests === 0) {
        needsFreshConnection = true;
    }
};
exports.requestFinished = requestFinished;
const connectDB = async () => {
    // In Cloudflare Workers, when all in-flight requests complete, the isolate is frozen.
    // The underlying TCP socket to MongoDB Atlas silently dies during suspension.
    // When a new request arrives after suspension, force-close the stale socket and reconnect.
    if (needsFreshConnection && mongoose_1.default.connection.readyState !== 0) {
        needsFreshConnection = false;
        try {
            if (typeof mongoose_1.default.connection.getClient === 'function') {
                const client = mongoose_1.default.connection.getClient();
                if (client && typeof client.close === 'function') {
                    await client.close(true);
                }
            }
        }
        catch (e) {
            console.warn('[connectDB] Force-close old socket warning:', e?.message);
        }
        mongoose_1.default.connection.readyState = 0;
        connPromise = null;
    }
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    if (connPromise && mongoose_1.default.connection.readyState === 2) {
        return connPromise;
    }
    const mongoUri = getMongoUri();
    connPromise = mongoose_1.default.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 10,
        bufferCommands: false,
        autoIndex: false,
    }).catch((err) => {
        connPromise = null;
        throw err;
    });
    const conn = await connPromise;
    console.log(`[connectDB] MongoDB Connected: ${mongoose_1.default.connection.host}`);
    return conn;
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
