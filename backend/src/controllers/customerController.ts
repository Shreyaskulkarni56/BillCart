import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Customer from '../models/Customer';

export const getCustomers = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const customers = await Customer.find({ user: userId });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const customer = new Customer({
            ...req.body,
            user: userId,
        });
        const createdCustomer = await customer.save();
        res.status(201).json(createdCustomer);
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists in your records' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const customer = await Customer.findOne({ _id: req.params.id, user: userId });
        if (customer) {
            Object.assign(customer, req.body);
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists in your records' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: userId });
        if (customer) {
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
