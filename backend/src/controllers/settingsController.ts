import { Request, Response } from 'express';
import Settings from '../models/Settings';

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings({
                shopName: "LAKSHMI AYURVEDA Distributors",
                companyName: "LAKSHMI AYURVEDA Distributors Pvt Ltd",
                tagline: "Quality Ayurvedic Products & Wellness",
                address: "123, Main Road, Near Bus Stand",
                city: "Bengaluru",
                state: "Karnataka",
                stateCode: "29",
                country: "India",
                pincode: "560001",
                phone: "+91 98765 43210",
                email: "shop@ayurveda.com",
                website: "https://lakshmiayurveda.com",
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
                accountHolder: "Lakshmi Ayurveda Distributors",
                accountNumber: "389201002938",
                ifscCode: "SBIN0001234",
                upiId: "lakshmiayurveda@upi",
                showQrCode: true,
                acceptedPaymentMethods: ["Cash", "UPI", "Card", "Net Banking"]
            });
            await settings.save();
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
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
        } else if (settingsData.shopName && !settingsData.companyName) {
            settingsData.companyName = settingsData.shopName;
        }
        
        let settings = await Settings.findOne();
        if (settings) {
            Object.assign(settings, settingsData);
            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            settings = new Settings(settingsData);
            const createdSettings = await settings.save();
            res.status(201).json(createdSettings);
        }
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const uploadLogo = async (req: Request, res: Response) => {
    try {
        const { logoUrl } = req.body;

        if (!logoUrl) {
            return res.status(400).json({ message: 'No logo image data provided.' });
        }

        // Validate image format (Data URL or HTTP URL)
        if (typeof logoUrl === 'string' && logoUrl.startsWith('data:')) {
            const isImage = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(logoUrl);
            if (!isImage) {
                return res.status(400).json({ message: 'Invalid image format. Allowed formats: PNG, JPEG, WEBP, GIF, SVG.' });
            }

            // Estimate base64 size (approx length * 0.75 bytes)
            const approxSizeBytes = (logoUrl.length - logoUrl.indexOf(',')) * 0.75;
            const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
            if (approxSizeBytes > maxSizeBytes) {
                return res.status(400).json({ message: 'Image size exceeds maximum limit of 5MB.' });
            }
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ shopName: "LAKSHMI AYURVEDA Distributors" });
        }

        settings.logoUrl = logoUrl;
        const updated = await settings.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload logo: ' + (error as Error).message });
    }
};

export const removeLogo = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings.logoUrl = "";
            const updated = await settings.save();
            return res.json(updated);
        }
        res.status(404).json({ message: 'Settings not found.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove logo.' });
    }
};
