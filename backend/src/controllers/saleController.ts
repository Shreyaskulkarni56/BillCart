import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Sale from '../models/Sale';
import Product from '../models/Product';
import Customer from '../models/Customer';
import Settings from '../models/Settings';
import { sendInvoiceEmail } from '../utils/emailService';

export const createSale = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const { customerId, items, subtotal, tax, total } = req.body;

        // 1. Validate Customer scoped to user
        const customer = await Customer.findOne({ _id: customerId, user: userId });
        if (!customer) {
            throw new Error('Customer not found or access denied');
        }

        // 2. Check and Deduct Stock (Quantity Billed + Free Quantity) scoped to user
        for (const item of items) {
            const product = await Product.findOne({ _id: item.productId, user: userId });
            if (!product) {
                throw new Error(`Product ${item.productName || "item"} not found or access denied`);
            }
            const totalQuantityToDeduct = Number(item.quantity || 0) + Number(item.freeQty || 0);
            if (product.stock < totalQuantityToDeduct) {
                throw new Error(
                    `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${totalQuantityToDeduct} (${item.quantity} billed + ${item.freeQty || 0} free)`
                );
            }
            product.stock -= totalQuantityToDeduct;
            await product.save();
        }

        // 3. Create Sale scoped to user
        // Generate Invoice Number for user
        const settings = await Settings.findOne({ user: userId });
        const prefix = settings?.invoicePrefix || 'SLN';
        const startNum = settings?.startingInvoiceNumber || 1;
        
        // Find the sale with the highest invoice number for this user
        const lastSale = await Sale.findOne({ user: userId }).sort({ createdAt: -1 });
        let nextInvoiceNumber = startNum;
        
        if (lastSale && lastSale.invoiceNo) {
            const numericPart = lastSale.invoiceNo.replace(/\D/g, '');
            if (numericPart) {
                nextInvoiceNumber = parseInt(numericPart, 10) + 1;
            } else {
                const count = await Sale.countDocuments({ user: userId });
                nextInvoiceNumber = count + 1;
            }
        }
        
        const invoiceNo = `${prefix}${String(nextInvoiceNumber).padStart(4, '0')}`;

        const sale = new Sale({
            user: userId,
            invoiceNo,
            customerId,
            customerName: customer.name,
            customerDlNo: customer.dlNo,
            customerGstinNo: customer.gstinNo,
            items,
            subtotal,
            tax,
            total,
        });

        const createdSale = await sale.save();

        // 4. Update Customer Total Purchases
        customer.totalPurchases += total;
        await customer.save();

        // 5. Send Email
        await sendInvoiceEmail(createdSale, customer);

        const obj = createdSale.toObject ? createdSale.toObject() : createdSale;
        res.status(201).json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getSales = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const sales = await Sale.find({ user: userId }).sort({ date: -1 }).lean();
        const formatted = sales.map((s: any) => ({
            ...s,
            id: s._id ? s._id.toString() : s.id,
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getSaleById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const sale = await Sale.findOne({ _id: req.params.id, user: userId }).lean();
        if (sale) {
            const formatted = {
                ...sale,
                id: (sale as any)._id ? (sale as any)._id.toString() : (sale as any).id,
            };
            res.json(formatted);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTodaysSales = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).lean();
        const formatted = sales.map((s: any) => ({
            ...s,
            id: s._id ? s._id.toString() : s.id,
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateSale = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const { date } = req.body;
        const sale = await Sale.findOne({ _id: req.params.id, user: userId });

        if (sale) {
            if (date) {
                sale.date = new Date(date);
            }
            const updatedSale = await sale.save();
            const obj = updatedSale.toObject ? updatedSale.toObject() : updatedSale;
            res.json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
