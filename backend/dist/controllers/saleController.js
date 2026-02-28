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
exports.getTodaysSales = exports.getSaleById = exports.getSales = exports.createSale = void 0;
const Sale_1 = __importDefault(require("../models/Sale"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const mongoose_1 = __importDefault(require("mongoose"));
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { customerId, items, subtotal, tax, total } = req.body;
        // 1. Validate Customer
        const customer = yield Customer_1.default.findById(customerId).session(session);
        if (!customer) {
            throw new Error('Customer not found');
        }
        // 2. Check and Deduct Stock
        // We need to re-verify stock for all items
        for (const item of items) {
            const product = yield Product_1.default.findById(item.productId).session(session);
            if (!product) {
                throw new Error(`Product ${item.productName} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }
            product.stock -= item.quantity;
            yield product.save({ session });
        }
        // 3. Create Sale
        // Generate Invoice Number (Simple counter for now, real app needs better logic)
        const count = yield Sale_1.default.countDocuments().session(session);
        const invoiceNo = `INV${String(count + 1).padStart(3, '0')}`;
        const sale = new Sale_1.default({
            invoiceNo,
            customerId,
            customerName: customer.name,
            items,
            subtotal,
            tax,
            total,
        });
        const createdSale = yield sale.save({ session });
        // 4. Update Customer Total Purchases
        customer.totalPurchases += total;
        yield customer.save({ session });
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json(createdSale);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
});
exports.createSale = createSale;
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield Sale_1.default.find({}).sort({ date: -1 });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getSales = getSales;
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield Sale_1.default.findById(req.params.id);
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
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const sales = yield Sale_1.default.find({
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getTodaysSales = getTodaysSales;
