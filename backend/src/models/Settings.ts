import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    // Business Profile
    shopName: string;
    companyName?: string;
    tagline?: string;
    address: string;
    city?: string;
    state: string;
    stateCode: string;
    country?: string;
    pincode?: string;
    phone: string;
    email: string;
    website?: string;
    logoUrl?: string;
    pan?: string;
    defaultCurrency?: string;

    // Invoice Templates & Branding Customization
    invoicePrefix: string;
    startingInvoiceNumber?: number;
    paperSize?: string;
    templateTheme?: string;
    showLogo?: boolean;
    customTerms?: string;
    primaryColor?: string;
    logoPosition?: 'left' | 'center' | 'right';
    showTagline?: boolean;
    showGstinInHeader?: boolean;
    showCompanyAddress?: boolean;
    showContactDetails?: boolean;

    // Payment Details
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
    showQrCode?: boolean;
    paymentInstructions?: string;
    defaultPaymentTerms?: string;
    acceptedPaymentMethods?: string[];

    // Tax & GST
    gstin: string;
    defaultGstRate?: number;
    taxType?: string;
    isComposition?: boolean;
    defaultHsn?: string;
}

const SettingsSchema = new Schema<ISettings>({
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
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
