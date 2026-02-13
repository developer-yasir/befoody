const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody_forced_local_v3';

const createOrder = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to:', uri);

        const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
        const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({ name: String, address: String }));
        const Order = mongoose.model('Order', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            restaurantId: mongoose.Schema.Types.ObjectId,
            items: Array,
            totalAmount: Number,
            status: String,
            riderId: mongoose.Schema.Types.ObjectId,
            createdAt: { type: Date, default: Date.now }
        }));

        const customer = await User.findOne({ email: 'john.doe@gmail.com' });
        const restaurant = await Restaurant.findOne({ name: "Luigi's Pizza Palace" });

        if (!customer || !restaurant) {
            console.log('Customer or Restaurant not found. Run seed first.');
            process.exit(1);
        }

        const order = await Order.create({
            userId: customer._id,
            restaurantId: restaurant._id,
            items: [
                { menuItemId: new mongoose.Types.ObjectId(), name: 'Pepperoni Pizza', quantity: 1, price: 15 },
                { menuItemId: new mongoose.Types.ObjectId(), name: 'Coke', quantity: 2, price: 2.5 }
            ],
            totalAmount: 20.00,
            status: 'ready_for_pickup',
            riderId: null
        });

        console.log('✅ Created Test Order:', order._id);
        console.log('Status: ready_for_pickup');

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

createOrder();
