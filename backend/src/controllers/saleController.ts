import { Request, Response } from 'express';
import Sale, { ISale } from '../models/Sale';
import Product from '../models/Product';
import Customer from '../models/Customer';
import mongoose from 'mongoose';
import { sendInvoiceEmail } from '../utils/emailService';

export const createSale = async (req: Request, res: Response) => {
    try {
        const { customerId, items, subtotal, tax, total } = req.body;

        // 1. Validate Customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // 2. Check and Deduct Stock
        // We need to re-verify stock for all items
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product ${item.productName} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }
            product.stock -= item.quantity;
            await product.save();
        }

        // 3. Create Sale
        // Generate Invoice Number
        const settings = await mongoose.model('Settings').findOne() as any;
        const prefix = settings?.invoicePrefix || 'SLN';
        
        // Find the sale with the highest invoice number (by sorting descending)
        const lastSale = await Sale.findOne().sort({ createdAt: -1 });
        let nextInvoiceNumber = 1;
        
        if (lastSale && lastSale.invoiceNo) {
            // Extract the numeric part from the last invoice string
            const numericPart = lastSale.invoiceNo.replace(/\D/g, '');
            if (numericPart) {
                nextInvoiceNumber = parseInt(numericPart, 10) + 1;
            } else {
                // Fallback to count if parsing fails
                const count = await Sale.countDocuments();
                nextInvoiceNumber = count + 1;
            }
        }
        
        const invoiceNo = `${prefix}${String(nextInvoiceNumber).padStart(4, '0')}`;

        const sale = new Sale({
            invoiceNo,
            customerId,
            customerName: customer.name,
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

        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getSales = async (req: Request, res: Response) => {
    try {
        const sales = await Sale.find({}).sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getSaleById = async (req: Request, res: Response) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTodaysSales = async (req: Request, res: Response) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
