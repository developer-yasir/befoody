const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');
const Order = require('./models/Order');
require('dotenv').config();

async function cleanDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all data except admin user
        console.log('🗑️  Cleaning database...');

        await Order.deleteMany({});
        console.log('   ✓ Deleted all orders');

        await FoodItem.deleteMany({});
        console.log('   ✓ Deleted all food items');

        await Restaurant.deleteMany({});
        console.log('   ✓ Deleted all restaurants');

        // Delete all users except admin
        const result = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`   ✓ Deleted ${result.deletedCount} non-admin users`);

        console.log('\n✅ Database cleaned successfully!');
        console.log('-----------------------------------');
        console.log('Next steps:');
        console.log('1. Run: node createAdmin.js (if needed)');
        console.log('2. Run: node seedUsersAndRiders.js');
        console.log('3. Run: node seedData.js');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
}

cleanDatabase();
