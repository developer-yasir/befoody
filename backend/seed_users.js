const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = 'mongodb://localhost:27017/befoody_forced_local_v3';

const seedDatabase = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Connected to:', uri);

        // Define User Schema inline to ensure we use this exact structure
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['customer', 'restaurant', 'admin', 'rider'], default: 'customer' },
            phone: String,
            createdAt: { type: Date, default: Date.now }
        });

        // Use existing model if defined, or compile it
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        console.log('🗑️ Clearing existing users...');
        await User.deleteMany({});
        console.log('✅ All users removed.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@befoody.com',
                password: hashedPassword,
                role: 'admin',
                phone: '555-0101'
            },
            {
                name: 'Restaurant Owner',
                email: 'owner@restaurant.com',
                password: hashedPassword,
                role: 'restaurant',
                phone: '555-0102'
            },
            {
                name: 'Rider Alex',
                email: 'alex.rider@befoody.com',
                password: hashedPassword,
                role: 'rider',
                phone: '555-0103'
            },
            {
                name: 'Customer John',
                email: 'john.doe@gmail.com',
                password: hashedPassword,
                role: 'customer',
                phone: '555-0104'
            }
        ];

        console.log('✨ Creating new users...');
        const createdUsers = await User.insertMany(users);

        console.log('\n✅ Database Populated Successfully!');
        console.log('-----------------------------------');
        createdUsers.forEach(u => {
            console.log(`👤 ${u.role.toUpperCase().padEnd(10)} | Email: ${u.email.padEnd(25)} | Pass: password123`);
        });
        console.log('-----------------------------------');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedDatabase();
