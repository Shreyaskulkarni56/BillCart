"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStockProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const products = await Product_1.default.find({ user: userId }).lean();
        const formatted = products.map((p) => ({
            ...p,
            id: p._id ? p._id.toString() : p.id,
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const product = new Product_1.default({
            ...req.body,
            user: userId,
        });
        const createdProduct = await product.save();
        const obj = createdProduct.toObject ? createdProduct.toObject() : createdProduct;
        res.status(201).json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A product with this SKU already exists in your inventory' });
        }
        else {
            res.status(400).json({ message: error.message || 'Invalid product data' });
        }
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const product = await Product_1.default.findOne({ _id: req.params.id, user: userId });
        if (product) {
            Object.assign(product, req.body);
            const updatedProduct = await product.save();
            const obj = updatedProduct.toObject ? updatedProduct.toObject() : updatedProduct;
            res.json({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A product with this SKU already exists in your inventory' });
        }
        else {
            res.status(400).json({ message: error.message || 'Invalid product data' });
        }
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const product = await Product_1.default.findOneAndDelete({ _id: req.params.id, user: userId });
        if (product) {
            res.json({ message: 'Product removed' });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteProduct = deleteProduct;
const getLowStockProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const products = await Product_1.default.find({
            user: userId,
            $expr: { $lte: ['$stock', '$minStock'] }
        }).lean();
        const formatted = products.map((p) => ({
            ...p,
            id: p._id ? p._id.toString() : p.id,
        }));
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getLowStockProducts = getLowStockProducts;
