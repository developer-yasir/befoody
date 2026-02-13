const mongoose = require('mongoose');
require('dotenv').config();

// Use ENV URI if provided, otherwise fallback
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

        const userId = '698ec955d7bf7377247728cf'; // Extracted from user token
        const orderId = '698df92d4b29ba0ffc77283b'; // Extracted from user log

        console.log(`\n--- Simulating Accept Order ---`);
        console.log(`Rider User ID: ${userId}`);
        console.log(`Order ID: ${orderId}`);

        // 1. Find Rider
        const rider = await Rider.findOne({ userId: userId });
        if (!rider) {
            console.log('❌ Rider not found');
            return;
        }
        console.log('✅ Rider found:', rider._id);
        console.log('   Active Order:', rider.activeOrderId);

        // 2. Find Order
        const order = await Order.findById(orderId);
        if (!order) {
            console.log('❌ Order not found');
            return;
        }
        console.log('✅ Order found:', order._id);
        console.log('   Status:', order.status);
        console.log('   Current Rider:', order.riderId);
        console.log('   User ID:', order.userId);

        // RESET STATE for testing
        console.log('🔄 Resetting Order to ready_for_pickup for debugging...');
        order.status = 'ready_for_pickup';
        order.riderId = null;
        await order.save();
        console.log('✅ Order reset.');

    } catch (e) {
        console.error('❌ Connection/Script Error:', e);
    } finally {
        mongoose.connection.close();
    }
};

debug();
