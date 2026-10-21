"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSale = exports.getTodaysSales = exports.getSaleById = exports.getSales = exports.createSale = void 0;
const Sale_1 = __importDefault(require("../models/Sale"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Settings_1 = __importDefault(require("../models/Settings"));
const emailService_1 = require("../utils/emailService");
const createSale = async (req, res) => {
    try {
        const userId = req.user._id;
        const { customerId, items, subtotal, tax, total } = req.body;
        // 1. Validate Customer scoped to user
        const customer = await Customer_1.default.findOne({ _id: customerId, user: userId });
        if (!customer) {
            throw new Error('Customer not found or access denied');
        }
        // 2. Check and Deduct Stock (Quantity Billed + Free Quantity) scoped to user
        for (const item of items) {
            const product = await Product_1.default.findOne({ _id: item.productId, user: userId });
            if (!product) {
                throw new Error(`Product ${item.productName || "item"} not found or access denied`);
            }
            const totalQuantityToDeduct = Number(item.quantity || 0) + Number(item.freeQty || 0);
            if (product.stock < totalQuantityToDeduct) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${totalQuantityToDeduct} (${item.quantity} billed + ${item.freeQty || 0} free)`);
            }
            product.stock -= totalQuantityToDeduct;
            await product.save();
        }
        // 3. Create Sale scoped to user
        // Generate Invoice Number for user
        const settings = await Settings_1.default.findOne({ user: userId });
        const prefix = settings?.invoicePrefix || 'SLN';
        const startNum = settings?.startingInvoiceNumber || 1;
        // Find the sale with the highest invoice number for this user
        const lastSale = await Sale_1.default.findOne({ user: userId }).sort({ createdAt: -1 });
        let nextInvoiceNumber = startNum;
        if (lastSale && lastSale.invoiceNo) {
            const numericPart = lastSale.invoiceNo.replace(/\D/g, '');
            if (numericPart) {
                nextInvoiceNumber = parseInt(numericPart, 10) + 1;
            }
            else {
                const count = await Sale_1.default.countDocuments({ user: userId });
                nextInvoiceNumber = count + 1;
            }
        }
        const invoiceNo = `${prefix}${String(nextInvoiceNumber).padStart(4, '0')}`;
        const sale = new Sale_1.default({
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
        await (0, emailService_1.sendInvoiceEmail)(createdSale, customer);
        const obj = createdSale.toObject ? createdSale.toObject() : createdSale;
        res.status(201).json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createSale = createSale;
const getSales = async (req, res) => {
    try {
        const userId = req.user._id;
        const sales = await Sale_1.default.find({ user: userId }).sort({ date: -1 }).lean();
        const formatted = sales.map((s) => ({
            ...s,
            id: s._id ? s._id.toString() : s.id,
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getSales = getSales;
const getSaleById = async (req, res) => {
    try {
        const userId = req.user._id;
        const sale = await Sale_1.default.findOne({ _id: req.params.id, user: userId }).lean();
        if (sale) {
            const formatted = {
                ...sale,
                id: sale._id ? sale._id.toString() : sale.id,
            };
            res.json(formatted);
        }
        else {
            res.status(404).json({ message: 'Sale not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getSaleById = getSaleById;
const getTodaysSales = async (req, res) => {
    try {
        const userId = req.user._id;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const sales = await Sale_1.default.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).lean();
        const formatted = sales.map((s) => ({
            ...s,
            id: s._id ? s._id.toString() : s.id,
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTodaysSales = getTodaysSales;
const updateSale = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.body;
        const sale = await Sale_1.default.findOne({ _id: req.params.id, user: userId });
        if (sale) {
            if (date) {
                sale.date = new Date(date);
            }
            const updatedSale = await sale.save();
            const obj = updatedSale.toObject ? updatedSale.toObject() : updatedSale;
            res.json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
        }
        else {
            res.status(404).json({ message: 'Sale not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateSale = updateSale;
