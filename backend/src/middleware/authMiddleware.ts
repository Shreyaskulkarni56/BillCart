import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    console.log('[protect] 1. Auth header:', req.headers.authorization ? req.headers.authorization.slice(0, 15) : 'missing');

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'billcart_secret_key_12345';
            const decoded = jwt.verify(token, secret) as { id: string };
            console.log('[protect] 2. Decoded user ID:', decoded.id, 'calling User.findById');

            const user = await User.findById(decoded.id).select('-password').lean();
            console.log('[protect] 3. User found:', !!user);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user as any;
            console.log('[protect] 4. User attached, calling next()');
            next();
        } catch (error: any) {
            console.error('Auth middleware error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
