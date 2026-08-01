import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customer = new Customer(req.body);
        const createdCustomer = await customer.save();
        res.status(201).json(createdCustomer);
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            Object.assign(customer, req.body);
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists' });
        } else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (customer) {
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
