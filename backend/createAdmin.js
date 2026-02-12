const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Create an admin user
async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@befoody.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@befoody.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@befoody.com',
            password: hashedPassword,
            role: 'admin',
            phone: '1234567890'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email: admin@befoody.com');
        console.log('Password: admin123');
        console.log('-----------------------------------');
        console.log('You can now login at http://localhost:5173/login');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
