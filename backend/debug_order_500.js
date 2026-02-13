const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody_forced_local_v3';

const debug = async () => {
    try {
        console.log('🔍 Connecting to:', uri);
        await mongoose.connect(uri);

        const Rider = mongoose.model('Rider', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            isAvailable: Boolean,
            activeOrderId: mongoose.Schema.Types.ObjectId
        }));

        const Order = mongoose.model('Order', new mongoose.Schema({
            riderId: mongoose.Schema.Types.ObjectId,
            status: String,
            userId: mongoose.Schema.Types.ObjectId
        }));

        const riderUserId = '698ecf5c62cf43c2c83a4cc3';
        const targetOrderId = '698ececda536cf1f378c9db9';

        console.log(`\n--- Inspecting Entities ---`);
        console.log(`Rider User ID: ${riderUserId}`);
        console.log(`Target Order ID: ${targetOrderId}`);

        // 1. Check Rider
        const rider = await Rider.findOne({ userId: riderUserId });
        if (!rider) {
            console.log('❌ Rider NOT found (Would return 404)');
        } else {
            console.log('✅ Rider found:', rider._id);
            if (rider.activeOrderId) console.log('   ⚠️ Rider already has active order:', rider.activeOrderId);
        }

        // 2. Check Order
        let order;
        try {
            order = await Order.findById(targetOrderId);
        } catch (err) {
            console.log('❌ Order ID is invalid format:', err.message);
        }

        if (!order) {
            console.log('❌ Order NOT found (Should return 400)');
        } else {
            console.log('✅ Order found:', order._id);
            console.log('   Status:', order.status);
            console.log('   User ID:', order.userId);
        }

        // 3. Check for any generic DB issues
        console.log('   Database connection is healthy.');

    } catch (e) {
        console.error('❌ Script Fatal Error:', e);
    } finally {
        mongoose.connection.close();
    }
};

debug();
