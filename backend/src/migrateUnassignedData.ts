import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db';
import User from './models/User';
import Product from './models/Product';
import Customer from './models/Customer';
import Sale from './models/Sale';
import Settings from './models/Settings';

const migrateUnassignedData = async () => {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) {
            console.error("No DB connection");
            process.exit(1);
        }

        // 1. Find or create the primary user
        let user = await User.findOne({ email: 'admin@billcart.com' });
        if (!user) {
            user = await User.create({
                name: 'Admin Store Owner',
                email: 'admin@billcart.com',
                password: 'password123',
                shopName: 'LAKSHMI AYURVEDA Distributors',
                phone: '+91 98765 43210'
            });
            console.log('Created primary user: admin@billcart.com / password123');
        } else {
            console.log(`Found user: ${user.email} (${user._id})`);
        }

        const userId = user._id;

        // 2. Attach unassigned Products
        const prodRes = await db.collection('products').updateMany(
            { user: { $exists: false } },
            { $set: { user: userId } }
        );
        console.log(`Updated ${prodRes.modifiedCount} products with user ID.`);

        // 3. Attach unassigned Customers
        const custRes = await db.collection('customers').updateMany(
            { user: { $exists: false } },
            { $set: { user: userId } }
        );
        console.log(`Updated ${custRes.modifiedCount} customers with user ID.`);

        // 4. Attach unassigned Sales
        const saleRes = await db.collection('sales').updateMany(
            { user: { $exists: false } },
            { $set: { user: userId } }
        );
        console.log(`Updated ${saleRes.modifiedCount} sales with user ID.`);

        // 5. Attach unassigned Settings
        const settRes = await db.collection('settings').updateMany(
            { user: { $exists: false } },
            { $set: { user: userId } }
        );
        console.log(`Updated ${settRes.modifiedCount} settings with user ID.`);

        console.log("\n✅ Migration complete! All existing data is now assigned to admin@billcart.com");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
};

migrateUnassignedData();
