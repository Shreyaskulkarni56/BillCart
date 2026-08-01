import { Request, Response } from 'express';
import Settings from '../models/Settings';

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings({
                shopName: "LAKSHMI AYURVEDA Distributors",
                address: "123, Main Road, Near Bus Stand\nCity Name, District - 560001",
                gstin: "29AABCU9603R1ZM",
                phone: "+91 98765 43210",
                email: "shop@ayurveda.com",
                state: "Karnataka",
                stateCode: "29",
                invoicePrefix: "SLN"
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
