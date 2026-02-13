const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// FORCE the local DB logic to match index.js
const uri = 'mongodb://localhost:27017/befoody_forced_local_v3';

const seed = async () => {
    try {
        console.log('🌱 Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('✅ Connected.');

        // -----------------------
        // 1. Define Schemas Inline (Safe Mode)
        // -----------------------
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['customer', 'restaurant', 'admin', 'rider'], default: 'customer' },
            phone: String,
            createdAt: { type: Date, default: Date.now }
        });

        const riderSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            vehicleType: { type: String, default: 'Bike' },
            vehicleNumber: { type: String, default: 'XYZ-123' },
            isAvailable: { type: Boolean, default: true },
            earnings: { type: Number, default: 0 }
        });

        const restaurantSchema = new mongoose.Schema({
            ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true },
            cuisine: String,
            rating: { type: Number, default: 4.5 },
            image: String
        });

        // -----------------------
        // 2. Get Models
        // -----------------------
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const Rider = mongoose.models.Rider || mongoose.model('Rider', riderSchema);
        const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

        // -----------------------
        // 3. Clear Database
        // -----------------------
        console.log('🗑️ Clearing collections...');
        await User.deleteMany({});
        await Rider.deleteMany({});
        await Restaurant.deleteMany({});
        console.log('✅ Cleared.');

        // -----------------------
        // 4. Create Users
        // -----------------------
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@befoody.com',
            password: hash,
            role: 'admin',
            phone: '555-ADMIN'
        });

        const riderUser = await User.create({
            name: 'Alex Rider',
            email: 'alex.rider@befoody.com',
            password: hash,
            role: 'rider',
            phone: '555-RIDER'
        });

        const restaurantUser = await User.create({
            name: 'Luigi Mario',
            email: 'owner@restaurant.com',
            password: hash,
            role: 'restaurant',
            phone: '555-CHEF'
        });

        const customerUser = await User.create({
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            password: hash,
            role: 'customer',
            phone: '555-CUST'
        });

        console.log('✅ Users Created.');

        // -----------------------
        // 5. Create Profiles
        // -----------------------

        // Rider Profile
        await Rider.create({
            userId: riderUser._id,
            vehicleType: 'Scooter',
            vehicleNumber: 'RIDE-99',
            isAvailable: true,
            earnings: 150.50
        });
        console.log('✅ Rider Profile Created for Alex.');

        // Restaurant Profile
        await Restaurant.create({
            ownerId: restaurantUser._id,
            name: "Luigi's Pizza Palace",
            cuisine: 'Italian',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
        });
        console.log('✅ Restaurant Profile Created for Luigi.');

        console.log('\n🎉 SEEDING COMPLETE! You can login now.');

    } catch (e) {
        console.error('❌ SEED ERROR:', e);
    } finally {
        mongoose.connection.close();
    }
};

seed();
