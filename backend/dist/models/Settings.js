"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SettingsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Business Profile
    shopName: { type: String, required: true },
    companyName: { type: String, default: "LAKSHMI AYURVEDA Distributors Pvt Ltd" },
    tagline: { type: String, default: "Quality Ayurvedic Products & Wellness" },
    address: { type: String },
    city: { type: String, default: "Bengaluru" },
    state: { type: String, default: "Karnataka" },
    stateCode: { type: String, default: "29" },
    country: { type: String, default: "India" },
    pincode: { type: String, default: "560001" },
    phone: { type: String },
    email: { type: String },
    website: { type: String, default: "https://lakshmiayurveda.com" },
    logoUrl: { type: String, default: "" },
    pan: { type: String, default: "AABCU9603R" },
    defaultCurrency: { type: String, default: "INR" },
    // Invoice Templates & Branding Customization
    invoicePrefix: { type: String, default: 'SLN' },
    startingInvoiceNumber: { type: Number, default: 1001 },
    paperSize: { type: String, default: 'A4' },
    templateTheme: { type: String, default: 'modern' },
    showLogo: { type: Boolean, default: true },
    customTerms: { type: String, default: "1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction.\n3. Thank you for your business!" },
    primaryColor: { type: String, default: "#4f46e5" },
    logoPosition: { type: String, default: "left" },
    showTagline: { type: Boolean, default: true },
    showGstinInHeader: { type: Boolean, default: true },
    showCompanyAddress: { type: Boolean, default: true },
    showContactDetails: { type: Boolean, default: true },
    // Payment Details
    bankName: { type: String, default: "State Bank of India" },
    accountHolder: { type: String, default: "Lakshmi Ayurveda Distributors" },
    accountNumber: { type: String, default: "389201002938" },
    ifscCode: { type: String, default: "SBIN0001234" },
    branchName: { type: String, default: "Indiranagar Branch, Bengaluru" },
    upiId: { type: String, default: "lakshmiayurveda@upi" },
    showQrCode: { type: Boolean, default: true },
    paymentInstructions: { type: String, default: "Please share payment reference ID / UTR number via WhatsApp +91 9876543210 for instant dispatch verification." },
    defaultPaymentTerms: { type: String, default: "Due on Receipt" },
    acceptedPaymentMethods: { type: [String], default: ["Cash", "UPI", "Card", "Net Banking"] },
    // Tax & GST
    gstin: { type: String },
    defaultGstRate: { type: Number, default: 12 },
    taxType: { type: String, default: 'exclusive' },
    isComposition: { type: Boolean, default: false },
    defaultHsn: { type: String, default: "30049011" }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});
exports.default = mongoose_1.default.model('Settings', SettingsSchema);
