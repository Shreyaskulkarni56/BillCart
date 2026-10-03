"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Settings_1 = __importDefault(require("../models/Settings"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Sale_1 = __importDefault(require("../models/Sale"));
const generateToken_1 = require("../utils/generateToken");
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, shopName, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }
        const userExists = yield User_1.default.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const user = yield User_1.default.create({
            name,
            email: email.toLowerCase(),
            password,
            shopName: shopName || `${name}'s Store`,
            phone: phone || '',
        });
        // Initialize user settings if none exist
        const existingSettings = yield Settings_1.default.findOne({ user: user._id });
        if (!existingSettings) {
            yield Settings_1.default.create({
                user: user._id,
                shopName: user.shopName || `${name}'s Store`,
                companyName: user.shopName || `${name}'s Store Pvt Ltd`,
                phone: user.phone || '',
                email: user.email,
            });
        }
        // Claim any remaining legacy unassigned records
        yield Product_1.default.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        yield Customer_1.default.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        yield Sale_1.default.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        yield Settings_1.default.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            shopName: user.shopName,
            phone: user.phone,
            token: (0, generateToken_1.generateToken)(user._id.toString()),
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.registerUser = registerUser;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const user = yield User_1.default.findOne({ email: email.toLowerCase() });
        if (user && (yield user.matchPassword(password))) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                shopName: user.shopName,
                phone: user.phone,
                token: (0, generateToken_1.generateToken)(user._id.toString()),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.loginUser = loginUser;
// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getMe = getMe;
