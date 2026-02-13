const mongoose = require('mongoose');
require('dotenv').config();

// Use ENV URI if provided, otherwise fallback
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody_forced_local_v3';

const debug = async () => {
    try {
        console.log('🔍 Connecting to:', uri);
        await mongoose.connect(uri);

        // Define schemas minimally for reading
        const Rider = mongoose.model('Rider', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            isAvailable: Boolean,
            activeOrderId: mongoose.Schema.Types.ObjectId
        }));

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));

        const Order = mongoose.model('Order', new mongoose.Schema({
            status: String,
            riderId: mongoose.Schema.Types.ObjectId,
            restaurantId: mongoose.Schema.Types.ObjectId,
            userId: mongoose.Schema.Types.ObjectId,
            createdAt: Date
        }));

        // 1. Check Rider State
        const riderUser = await User.findOne({ email: 'alex.rider@befoody.com' });
        if (!riderUser) {
            console.log('❌ Rider User not found');
            return;
        }

        const riderProfile = await Rider.findOne({ userId: riderUser._id });
        console.log('\n--- Rider Profile ---');
        console.log('ID:', riderProfile._id);
        console.log('Is Available:', riderProfile.isAvailable);
        console.log('Active Order ID:', riderProfile.activeOrderId ? riderProfile.activeOrderId : 'None');

        // 2. Check Recent Orders
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log('\n--- Recent 5 Orders ---');
        recentOrders.forEach(o => {
            console.log(`Order ID: ${o._id}`);
            console.log(`- Status: "${o.status}"`);
            console.log(`- Rider ID: ${o.riderId}`);
            console.log(`- Created: ${o.createdAt}`);
            console.log('----------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

debug();
