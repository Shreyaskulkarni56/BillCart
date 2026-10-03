import { Request, Response } from 'express';
import User from '../models/User';
import Settings from '../models/Settings';
import Product from '../models/Product';
import Customer from '../models/Customer';
import Sale from '../models/Sale';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, shopName, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            shopName: shopName || `${name}'s Store`,
            phone: phone || '',
        });

        // Initialize user settings if none exist
        const existingSettings = await Settings.findOne({ user: user._id });
        if (!existingSettings) {
            await Settings.create({
                user: user._id,
                shopName: user.shopName || `${name}'s Store`,
                companyName: user.shopName || `${name}'s Store Pvt Ltd`,
                phone: user.phone || '',
                email: user.email,
            });
        }

        // Claim any remaining legacy unassigned records
        await Product.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        await Customer.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        await Sale.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        await Settings.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            shopName: user.shopName,
            phone: user.phone,
            token: generateToken(user._id.toString()),
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                shopName: user.shopName,
                phone: user.phone,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            shopName: user.shopName,
            phone: user.phone,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
