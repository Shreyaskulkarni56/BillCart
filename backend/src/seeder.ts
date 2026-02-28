import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product';
import Customer from './models/Customer';
import connectDB from './config/db';

dotenv.config();
connectDB();

const products = [
    { name: "Paracetamol 500mg", category: "Medicine", price: 25, mrp: 30, stock: 150, minStock: 50, unit: "Strip", sku: "MED001", batchNo: "B240115", hsnCode: "3004", gstRate: 12, expiryDate: "2025-06-15" },
    { name: "Cough Syrup 100ml", category: "Medicine", price: 85, mrp: 95, stock: 45, minStock: 30, unit: "Bottle", sku: "MED002", batchNo: "B240116", hsnCode: "3004", gstRate: 12, expiryDate: "2025-03-20" },
    { name: "Bandage Roll", category: "First Aid", price: 35, mrp: 40, stock: 8, minStock: 20, unit: "Piece", sku: "FA001", batchNo: "B240110", hsnCode: "3005", gstRate: 12, expiryDate: "2027-12-31" },
    { name: "Antiseptic Cream", category: "First Aid", price: 65, mrp: 75, stock: 62, minStock: 25, unit: "Tube", sku: "FA002", batchNo: "B240112", hsnCode: "3004", gstRate: 12, expiryDate: "2025-02-10" },
    { name: "Digital Thermometer", category: "Equipment", price: 250, mrp: 299, stock: 12, minStock: 10, unit: "Piece", sku: "EQ001", batchNo: "B240101", hsnCode: "9025", gstRate: 18 },
    { name: "Blood Pressure Monitor", category: "Equipment", price: 1850, mrp: 2100, stock: 5, minStock: 5, unit: "Piece", sku: "EQ002", batchNo: "B240102", hsnCode: "9018", gstRate: 12 },
    { name: "Vitamin C Tablets", category: "Supplements", price: 120, mrp: 150, stock: 0, minStock: 40, unit: "Bottle", sku: "SUP001", batchNo: "B240108", hsnCode: "2106", gstRate: 18, expiryDate: "2025-01-05" },
    { name: "Calcium + D3", category: "Supplements", price: 180, mrp: 210, stock: 35, minStock: 30, unit: "Bottle", sku: "SUP002", batchNo: "B240109", hsnCode: "2106", gstRate: 18, expiryDate: "2026-08-15" },
    { name: "Face Mask N95", category: "Protection", price: 45, mrp: 50, stock: 200, minStock: 100, unit: "Piece", sku: "PR001", batchNo: "B240105", hsnCode: "6307", gstRate: 5, expiryDate: "2027-01-01" },
    { name: "Hand Sanitizer 500ml", category: "Hygiene", price: 95, mrp: 110, stock: 18, minStock: 25, unit: "Bottle", sku: "HY001", batchNo: "B240106", hsnCode: "3808", gstRate: 18, expiryDate: "2025-04-30" },
    { name: "Cotton Rolls", category: "First Aid", price: 55, mrp: 65, stock: 75, minStock: 30, unit: "Pack", sku: "FA003", batchNo: "B240107", hsnCode: "5601", gstRate: 5 },
    { name: "Glucometer Strips", category: "Equipment", price: 450, mrp: 500, stock: 22, minStock: 15, unit: "Box", sku: "EQ003", batchNo: "B240103", hsnCode: "9027", gstRate: 12, expiryDate: "2025-09-30" },
];

const customers = [
    { name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@email.com", address: "123 Main Street, Delhi", totalPurchases: 15600 },
    { name: "Priya Sharma", phone: "9876543211", email: "priya@email.com", address: "456 Park Road, Mumbai", totalPurchases: 8900 },
    { name: "Amit Patel", phone: "9876543212", email: "amit@email.com", address: "789 Lake View, Ahmedabad", totalPurchases: 22400 },
    { name: "Sunita Devi", phone: "9876543213", email: "sunita@email.com", address: "321 Garden Lane, Pune", totalPurchases: 5600 },
    { name: "Walk-in Customer", phone: "0000000000", email: "-", address: "-", totalPurchases: 0 },
];

const seedData = async () => {
    try {
        await Product.deleteMany();
        await Customer.deleteMany();
        // Sales are not deleted to preserve history if needed, but for fresh seed:
        // await Sale.deleteMany();

        await Product.insertMany(products);
        await Customer.insertMany(customers);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
