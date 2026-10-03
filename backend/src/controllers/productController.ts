import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Product from '../models/Product';

export const getProducts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const products = await Product.find({ user: userId });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const product = new Product({
            ...req.body,
            user: userId,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A product with this SKU already exists in your inventory' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid product data' });
        }
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const product = await Product.findOne({ _id: req.params.id, user: userId });
        if (product) {
            Object.assign(product, req.body);
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A product with this SKU already exists in your inventory' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid product data' });
        }
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const product = await Product.findOneAndDelete({ _id: req.params.id, user: userId });
        if (product) {
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const products = await Product.find({
            user: userId,
            $expr: { $lte: ['$stock', '$minStock'] }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
