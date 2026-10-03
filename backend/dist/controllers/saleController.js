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
exports.updateSale = exports.getTodaysSales = exports.getSaleById = exports.getSales = exports.createSale = void 0;
const Sale_1 = __importDefault(require("../models/Sale"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Settings_1 = __importDefault(require("../models/Settings"));
const emailService_1 = require("../utils/emailService");
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { customerId, items, subtotal, tax, total } = req.body;
        // 1. Validate Customer scoped to user
        const customer = yield Customer_1.default.findOne({ _id: customerId, user: userId });
        if (!customer) {
            throw new Error('Customer not found or access denied');
        }
        // 2. Check and Deduct Stock (Quantity Billed + Free Quantity) scoped to user
        for (const item of items) {
            const product = yield Product_1.default.findOne({ _id: item.productId, user: userId });
            if (!product) {
                throw new Error(`Product ${item.productName || "item"} not found or access denied`);
            }
            const totalQuantityToDeduct = Number(item.quantity || 0) + Number(item.freeQty || 0);
            if (product.stock < totalQuantityToDeduct) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${totalQuantityToDeduct} (${item.quantity} billed + ${item.freeQty || 0} free)`);
            }
            product.stock -= totalQuantityToDeduct;
            yield product.save();
        }
        // 3. Create Sale scoped to user
        // Generate Invoice Number for user
        const settings = yield Settings_1.default.findOne({ user: userId });
        const prefix = (settings === null || settings === void 0 ? void 0 : settings.invoicePrefix) || 'SLN';
        const startNum = (settings === null || settings === void 0 ? void 0 : settings.startingInvoiceNumber) || 1;
        // Find the sale with the highest invoice number for this user
        const lastSale = yield Sale_1.default.findOne({ user: userId }).sort({ createdAt: -1 });
        let nextInvoiceNumber = startNum;
        if (lastSale && lastSale.invoiceNo) {
            const numericPart = lastSale.invoiceNo.replace(/\D/g, '');
            if (numericPart) {
                nextInvoiceNumber = parseInt(numericPart, 10) + 1;
            }
            else {
                const count = yield Sale_1.default.countDocuments({ user: userId });
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
        const createdSale = yield sale.save();
        // 4. Update Customer Total Purchases
        customer.totalPurchases += total;
        yield customer.save();
        // 5. Send Email
        yield (0, emailService_1.sendInvoiceEmail)(createdSale, customer);
        res.status(201).json(createdSale);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createSale = createSale;
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const sales = yield Sale_1.default.find({ user: userId }).sort({ date: -1 });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getSales = getSales;
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const sale = yield Sale_1.default.findOne({ _id: req.params.id, user: userId });
        if (sale) {
            res.json(sale);
        }
        else {
            res.status(404).json({ message: 'Sale not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getSaleById = getSaleById;
const getTodaysSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const sales = yield Sale_1.default.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getTodaysSales = getTodaysSales;
const updateSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { date } = req.body;
        const sale = yield Sale_1.default.findOne({ _id: req.params.id, user: userId });
        if (sale) {
            if (date) {
                sale.date = new Date(date);
            }
            const updatedSale = yield sale.save();
            res.json(updatedSale);
        }
        else {
            res.status(404).json({ message: 'Sale not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.updateSale = updateSale;
