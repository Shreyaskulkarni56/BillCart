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
exports.removeLogo = exports.uploadLogo = exports.updateSettings = exports.getSettings = void 0;
const Settings_1 = __importDefault(require("../models/Settings"));
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const userId = req.user._id;
        let settings = yield Settings_1.default.findOne({ user: userId });
        if (!settings) {
            settings = new Settings_1.default({
                user: userId,
                shopName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.shopName) || "LAKSHMI AYURVEDA Distributors",
                companyName: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.shopName) || "LAKSHMI AYURVEDA Distributors Pvt Ltd",
                tagline: "Quality Products & Wellness",
                address: "123 Main Street",
                city: "Bengaluru",
                state: "Karnataka",
                stateCode: "29",
                country: "India",
                pincode: "560001",
                phone: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.phone) || "+91 98765 43210",
                email: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.email) || "shop@example.com",
                website: "https://billcart.app",
                logoUrl: "",
                pan: "AABCU9603R",
                defaultCurrency: "INR",
                gstin: "29AABCU9603R1ZM",
                defaultGstRate: 12,
                taxType: "exclusive",
                isComposition: false,
                defaultHsn: "30049011",
                invoicePrefix: "SLN",
                startingInvoiceNumber: 1001,
                paperSize: "A4",
                templateTheme: "modern",
                showLogo: true,
                customTerms: "1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction.\n3. Thank you for your business!",
                bankName: "State Bank of India",
                accountHolder: ((_e = req.user) === null || _e === void 0 ? void 0 : _e.shopName) || "Store Owner",
                accountNumber: "389201002938",
                ifscCode: "SBIN0001234",
                upiId: "store@upi",
                showQrCode: true,
                acceptedPaymentMethods: ["Cash", "UPI", "Card", "Net Banking"]
            });
            yield settings.save();
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const settingsData = req.body;
        // Validation
        const name = settingsData.companyName || settingsData.shopName;
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Company / Store Name is required.' });
        }
        if (settingsData.email && settingsData.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(settingsData.email)) {
                return res.status(400).json({ message: 'Invalid email address format.' });
            }
        }
        if (settingsData.gstin && settingsData.gstin.trim() !== '') {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(settingsData.gstin.toUpperCase())) {
                return res.status(400).json({ message: 'Invalid GSTIN format (e.g. 29AABCU9603R1ZM).' });
            }
        }
        if (settingsData.pan && settingsData.pan.trim() !== '') {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(settingsData.pan.toUpperCase())) {
                return res.status(400).json({ message: 'Invalid PAN format (e.g. ABCDE1234F).' });
            }
        }
        // Keep shopName & companyName synced if one is updated
        if (settingsData.companyName && !settingsData.shopName) {
            settingsData.shopName = settingsData.companyName;
        }
        else if (settingsData.shopName && !settingsData.companyName) {
            settingsData.companyName = settingsData.shopName;
        }
        let settings = yield Settings_1.default.findOne({ user: userId });
        if (settings) {
            Object.assign(settings, settingsData);
            const updatedSettings = yield settings.save();
            res.json(updatedSettings);
        }
        else {
            settings = new Settings_1.default(Object.assign(Object.assign({}, settingsData), { user: userId }));
            const createdSettings = yield settings.save();
            res.status(201).json(createdSettings);
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateSettings = updateSettings;
const uploadLogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user._id;
        const { logoUrl } = req.body;
        if (!logoUrl) {
            return res.status(400).json({ message: 'No logo image data provided.' });
        }
        if (typeof logoUrl === 'string' && logoUrl.startsWith('data:')) {
            const isImage = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(logoUrl);
            if (!isImage) {
                return res.status(400).json({ message: 'Invalid image format. Allowed formats: PNG, JPEG, WEBP, GIF, SVG.' });
            }
            const approxSizeBytes = (logoUrl.length - logoUrl.indexOf(',')) * 0.75;
            const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
            if (approxSizeBytes > maxSizeBytes) {
                return res.status(400).json({ message: 'Image size exceeds maximum limit of 5MB.' });
            }
        }
        let settings = yield Settings_1.default.findOne({ user: userId });
        if (!settings) {
            settings = new Settings_1.default({ user: userId, shopName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.shopName) || "My Store" });
        }
        settings.logoUrl = logoUrl;
        const updated = yield settings.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to upload logo: ' + error.message });
    }
});
exports.uploadLogo = uploadLogo;
const removeLogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        let settings = yield Settings_1.default.findOne({ user: userId });
        if (settings) {
            settings.logoUrl = "";
            const updated = yield settings.save();
            return res.json(updated);
        }
        res.status(404).json({ message: 'Settings not found.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to remove logo.' });
    }
});
exports.removeLogo = removeLogo;
