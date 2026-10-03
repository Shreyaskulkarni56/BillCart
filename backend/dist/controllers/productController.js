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
exports.getLowStockProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const products = yield Product_1.default.find({ user: userId });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const product = new Product_1.default(Object.assign(Object.assign({}, req.body), { user: userId }));
        const createdProduct = yield product.save();
        res.status(201).json(createdProduct);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A product with this SKU already exists in your inventory' });
        }
        else {
            res.status(400).json({ message: error.message || 'Invalid product data' });
        }
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const product = yield Product_1.default.findOne({ _id: req.params.id, user: userId });
        if (product) {
            Object.assign(product, req.body);
            const updatedProduct = yield product.save();
            res.json(updatedProduct);
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
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const product = yield Product_1.default.findOneAndDelete({ _id: req.params.id, user: userId });
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
});
exports.deleteProduct = deleteProduct;
const getLowStockProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const products = yield Product_1.default.find({
            user: userId,
            $expr: { $lte: ['$stock', '$minStock'] }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getLowStockProducts = getLowStockProducts;
