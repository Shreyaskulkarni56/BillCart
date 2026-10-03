import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db';
import User from './models/User';

const checkData = async () => {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
        console.error("No DB connection");
        process.exit(1);
    }

    const usersCount = await db.collection('users').countDocuments();
    const productsTotal = await db.collection('products').countDocuments();
    const productsWithoutUser = await db.collection('products').countDocuments({ user: { $exists: false } });

    const customersTotal = await db.collection('customers').countDocuments();
    const customersWithoutUser = await db.collection('customers').countDocuments({ user: { $exists: false } });

    const salesTotal = await db.collection('sales').countDocuments();
    const salesWithoutUser = await db.collection('sales').countDocuments({ user: { $exists: false } });

    const settingsTotal = await db.collection('settings').countDocuments();
    const settingsWithoutUser = await db.collection('settings').countDocuments({ user: { $exists: false } });

    console.log("=== DB DATA DIAGNOSTIC ===");
    console.log(`Users count: ${usersCount}`);
    console.log(`Products: Total = ${productsTotal}, Unassigned = ${productsWithoutUser}`);
    console.log(`Customers: Total = ${customersTotal}, Unassigned = ${customersWithoutUser}`);
    console.log(`Sales: Total = ${salesTotal}, Unassigned = ${salesWithoutUser}`);
    console.log(`Settings: Total = ${settingsTotal}, Unassigned = ${settingsWithoutUser}`);

    const allUsers = await User.find({}, 'name email shopName');
    console.log("Existing Users in DB:", allUsers);

    process.exit(0);
};

checkData();
