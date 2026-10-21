"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomers = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const getCustomers = async (req, res) => {
    try {
        const userId = req.user._id;
        const customers = await Customer_1.default.find({ user: userId });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        const userId = req.user._id;
        const customer = new Customer_1.default({
            ...req.body,
            user: userId,
        });
        const createdCustomer = await customer.save();
        res.status(201).json(createdCustomer);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists in your records' });
        }
        else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const userId = req.user._id;
        const customer = await Customer_1.default.findOne({ _id: req.params.id, user: userId });
        if (customer) {
            Object.assign(customer, req.body);
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        }
        else {
            res.status(404).json({ message: 'Customer not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A customer with this phone number already exists in your records' });
        }
        else {
            res.status(400).json({ message: error.message || 'Invalid customer data' });
        }
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const userId = req.user._id;
        const customer = await Customer_1.default.findOneAndDelete({ _id: req.params.id, user: userId });
        if (customer) {
            res.json({ message: 'Customer removed' });
        }
        else {
            res.status(404).json({ message: 'Customer not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteCustomer = deleteCustomer;
