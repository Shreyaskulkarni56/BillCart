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
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./config/db"));
const User_1 = __importDefault(require("./models/User"));
const migrateUnassignedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        const db = mongoose_1.default.connection.db;
        if (!db) {
            console.error("No DB connection");
            process.exit(1);
        }
        // 1. Find or create the primary user
        let user = yield User_1.default.findOne({ email: 'admin@billcart.com' });
        if (!user) {
            user = yield User_1.default.create({
                name: 'Admin Store Owner',
                email: 'admin@billcart.com',
                password: 'password123',
                shopName: 'LAKSHMI AYURVEDA Distributors',
                phone: '+91 98765 43210'
            });
            console.log('Created primary user: admin@billcart.com / password123');
        }
        else {
            console.log(`Found user: ${user.email} (${user._id})`);
        }
        const userId = user._id;
        // 2. Attach unassigned Products
        const prodRes = yield db.collection('products').updateMany({ user: { $exists: false } }, { $set: { user: userId } });
        console.log(`Updated ${prodRes.modifiedCount} products with user ID.`);
        // 3. Attach unassigned Customers
        const custRes = yield db.collection('customers').updateMany({ user: { $exists: false } }, { $set: { user: userId } });
        console.log(`Updated ${custRes.modifiedCount} customers with user ID.`);
        // 4. Attach unassigned Sales
        const saleRes = yield db.collection('sales').updateMany({ user: { $exists: false } }, { $set: { user: userId } });
        console.log(`Updated ${saleRes.modifiedCount} sales with user ID.`);
        // 5. Attach unassigned Settings
        const settRes = yield db.collection('settings').updateMany({ user: { $exists: false } }, { $set: { user: userId } });
        console.log(`Updated ${settRes.modifiedCount} settings with user ID.`);
        console.log("\n✅ Migration complete! All existing data is now assigned to admin@billcart.com");
        process.exit(0);
    }
    catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
});
migrateUnassignedData();
