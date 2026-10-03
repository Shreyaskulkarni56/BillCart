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
const checkData = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    const db = mongoose_1.default.connection.db;
    if (!db) {
        console.error("No DB connection");
        process.exit(1);
    }
    const usersCount = yield db.collection('users').countDocuments();
    const productsTotal = yield db.collection('products').countDocuments();
    const productsWithoutUser = yield db.collection('products').countDocuments({ user: { $exists: false } });
    const customersTotal = yield db.collection('customers').countDocuments();
    const customersWithoutUser = yield db.collection('customers').countDocuments({ user: { $exists: false } });
    const salesTotal = yield db.collection('sales').countDocuments();
    const salesWithoutUser = yield db.collection('sales').countDocuments({ user: { $exists: false } });
    const settingsTotal = yield db.collection('settings').countDocuments();
    const settingsWithoutUser = yield db.collection('settings').countDocuments({ user: { $exists: false } });
    console.log("=== DB DATA DIAGNOSTIC ===");
    console.log(`Users count: ${usersCount}`);
    console.log(`Products: Total = ${productsTotal}, Unassigned = ${productsWithoutUser}`);
    console.log(`Customers: Total = ${customersTotal}, Unassigned = ${customersWithoutUser}`);
    console.log(`Sales: Total = ${salesTotal}, Unassigned = ${salesWithoutUser}`);
    console.log(`Settings: Total = ${settingsTotal}, Unassigned = ${settingsWithoutUser}`);
    const allUsers = yield User_1.default.find({}, 'name email shopName');
    console.log("Existing Users in DB:", allUsers);
    process.exit(0);
});
checkData();
