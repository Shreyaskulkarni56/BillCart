"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    console.log('[protect] 1. Auth header:', req.headers.authorization ? req.headers.authorization.slice(0, 15) : 'missing');
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'billcart_secret_key_12345';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log('[protect] 2. Decoded user ID:', decoded.id, 'calling User.findById');
            const user = await User_1.default.findById(decoded.id).select('-password').lean();
            console.log('[protect] 3. User found:', !!user);
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;
            console.log('[protect] 4. User attached, calling next()');
            next();
        }
        catch (error) {
            console.error('Auth middleware error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
exports.protect = protect;
