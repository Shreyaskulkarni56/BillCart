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
const dotenv_1 = __importDefault(require("dotenv"));
const Product_1 = __importDefault(require("./models/Product"));
const Customer_1 = __importDefault(require("./models/Customer"));
const User_1 = __importDefault(require("./models/User"));
const Settings_1 = __importDefault(require("./models/Settings"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
(0, db_1.default)();
const productsData = [
    { name: "Paracetamol 500mg", category: "Medicine", price: 25, mrp: 30, stock: 150, minStock: 50, unit: "Strip", sku: "MED001", batchNo: "B240115", hsnCode: "3004", gstRate: 12, expiryDate: new Date("2025-06-15") },
    { name: "Cough Syrup 100ml", category: "Medicine", price: 85, mrp: 95, stock: 45, minStock: 30, unit: "Bottle", sku: "MED002", batchNo: "B240116", hsnCode: "3004", gstRate: 12, expiryDate: new Date("2025-03-20") },
    { name: "Bandage Roll", category: "First Aid", price: 35, mrp: 40, stock: 8, minStock: 20, unit: "Piece", sku: "FA001", batchNo: "B240110", hsnCode: "3005", gstRate: 12, expiryDate: new Date("2027-12-31") },
    { name: "Antiseptic Cream", category: "First Aid", price: 65, mrp: 75, stock: 62, minStock: 25, unit: "Tube", sku: "FA002", batchNo: "B240112", hsnCode: "3004", gstRate: 12, expiryDate: new Date("2025-02-10") },
    { name: "Digital Thermometer", category: "Equipment", price: 250, mrp: 299, stock: 12, minStock: 10, unit: "Piece", sku: "EQ001", batchNo: "B240101", hsnCode: "9025", gstRate: 18 },
    { name: "Blood Pressure Monitor", category: "Equipment", price: 1850, mrp: 2100, stock: 5, minStock: 5, unit: "Piece", sku: "EQ002", batchNo: "B240102", hsnCode: "9018", gstRate: 12 },
    { name: "Vitamin C Tablets", category: "Supplements", price: 120, mrp: 150, stock: 0, minStock: 40, unit: "Bottle", sku: "SUP001", batchNo: "B240108", hsnCode: "2106", gstRate: 18, expiryDate: new Date("2025-01-05") },
    { name: "Calcium + D3", category: "Supplements", price: 180, mrp: 210, stock: 35, minStock: 30, unit: "Bottle", sku: "SUP002", batchNo: "B240109", hsnCode: "2106", gstRate: 18, expiryDate: new Date("2026-08-15") },
    { name: "Face Mask N95", category: "Protection", price: 45, mrp: 50, stock: 200, minStock: 100, unit: "Piece", sku: "PR001", batchNo: "B240105", hsnCode: "6307", gstRate: 5, expiryDate: new Date("2027-01-01") },
    { name: "Hand Sanitizer 500ml", category: "Hygiene", price: 95, mrp: 110, stock: 18, minStock: 25, unit: "Bottle", sku: "HY001", batchNo: "B240106", hsnCode: "3808", gstRate: 18, expiryDate: new Date("2025-04-30") },
    { name: "Cotton Rolls", category: "First Aid", price: 55, mrp: 65, stock: 75, minStock: 30, unit: "Pack", sku: "FA003", batchNo: "B240107", hsnCode: "5601", gstRate: 5 },
    { name: "Glucometer Strips", category: "Equipment", price: 450, mrp: 500, stock: 22, minStock: 15, unit: "Box", sku: "EQ003", batchNo: "B240103", hsnCode: "9027", gstRate: 12, expiryDate: new Date("2025-09-30") },
];
const customersData = [
    { name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@email.com", address: "123 Main Street, Delhi", totalPurchases: 15600 },
    { name: "Priya Sharma", phone: "9876543211", email: "priya@email.com", address: "456 Park Road, Mumbai", totalPurchases: 8900 },
    { name: "Amit Patel", phone: "9876543212", email: "amit@email.com", address: "789 Lake View, Ahmedabad", totalPurchases: 22400 },
    { name: "Sunita Devi", phone: "9876543213", email: "sunita@email.com", address: "321 Garden Lane, Pune", totalPurchases: 5600 },
    { name: "Walk-in Customer", phone: "0000000000", email: "-", address: "-", totalPurchases: 0 },
];
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield User_1.default.findOne({ email: 'admin@billcart.com' });
        if (!user) {
            user = yield User_1.default.create({
                name: 'Admin User',
                email: 'admin@billcart.com',
                password: 'password123',
                shopName: 'LAKSHMI AYURVEDA Distributors',
                phone: '+91 98765 43210'
            });
            console.log('Created default admin user: admin@billcart.com / password123');
        }
        yield Product_1.default.deleteMany({ user: user._id });
        yield Customer_1.default.deleteMany({ user: user._id });
        const products = productsData.map(p => (Object.assign(Object.assign({}, p), { user: user._id })));
        const customers = customersData.map(c => (Object.assign(Object.assign({}, c), { user: user._id })));
        yield Product_1.default.insertMany(products);
        yield Customer_1.default.insertMany(customers);
        const existingSettings = yield Settings_1.default.findOne({ user: user._id });
        if (!existingSettings) {
            yield Settings_1.default.create({
                user: user._id,
                shopName: "LAKSHMI AYURVEDA Distributors",
                companyName: "LAKSHMI AYURVEDA Distributors Pvt Ltd",
                tagline: "Quality Ayurvedic Products & Wellness",
                address: "123, Main Road, Near Bus Stand",
                city: "Bengaluru",
                state: "Karnataka",
                stateCode: "29",
                country: "India",
                pincode: "560001",
                phone: "+91 98765 43210",
                email: "admin@billcart.com",
            });
        }
        console.log('Data Imported Successfully for admin user!');
        process.exit();
    }
    catch (error) {
        console.error(`Seeder Error: ${error}`);
        process.exit(1);
    }
});
seedData();
