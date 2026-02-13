const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use ENV URI if provided, otherwise fallback
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody_forced_local_v3';

const seed = async () => {
    try {
        console.log('🌱 Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('✅ Connected.');

        // -----------------------
        // 1. Define Schemas Inline (Safe Mode)
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
            vehicleType: { type: String, enum: ['bike', 'scooter', 'car', 'bicycle'], default: 'bike' },
            vehicleNumber: { type: String, default: 'XYZ-123' },
            licenseNumber: { type: String, required: true },
            isAvailable: { type: Boolean, default: true },
            earnings: { type: Number, default: 0 },
            activeOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
        });

        const restaurantSchema = new mongoose.Schema({
            ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true },
            cuisine: [String],
            rating: { type: Number, default: 4.5 },
            imageUrl: String,
            isActive: { type: Boolean, default: true }
        });

        const foodItemSchema = new mongoose.Schema({
            name: { type: String, required: true },
            description: String,
            price: { type: Number, required: true },
            category: String,
            imageUrl: String,
            restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
            isVegetarian: { type: Boolean, default: false },
            isAvailable: { type: Boolean, default: true }
        });

        // -----------------------
        // 2. Get Models
        // -----------------------
        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const Rider = mongoose.models.Rider || mongoose.model('Rider', riderSchema);
        const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
        const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', foodItemSchema);

        // -----------------------
        // 3. Clear Database
        // -----------------------
        console.log('🗑️ Clearing collections...');
        await Promise.all([
            User.deleteMany({}),
            Rider.deleteMany({}),
            Restaurant.deleteMany({}),
            FoodItem.deleteMany({}),
            mongoose.connection.collection('orders').deleteMany({})
        ]);
        console.log('✅ Cleared.');

        // -----------------------
        // 4. Create Users
        // -----------------------
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.create([
            // -- Admin --
            { name: 'Admin User', email: 'admin@befoody.com', password: hashedPassword, role: 'admin', phone: '555-ADMIN' },

            // -- Riders --
            { name: 'Alex Rider', email: 'alex.rider@befoody.com', password: hashedPassword, role: 'rider', phone: '555-RIDE1' },
            { name: 'Sarah Zoom', email: 'sarah.rider@befoody.com', password: hashedPassword, role: 'rider', phone: '555-RIDE2' },
            { name: 'Mike Fast', email: 'mike.rider@befoody.com', password: hashedPassword, role: 'rider', phone: '555-RIDE3' },

            // -- Restaurant Owners --
            { name: 'Luigi Mario', email: 'owner@restaurant.com', password: hashedPassword, role: 'restaurant', phone: '555-CHEF1' },
            { name: 'Hanzo Sushi', email: 'hanzo@sushi.com', password: hashedPassword, role: 'restaurant', phone: '555-CHEF2' },
            { name: 'Bob Burger', email: 'bob@burger.com', password: hashedPassword, role: 'restaurant', phone: '555-CHEF3' },

            // -- Customers --
            { name: 'John Doe', email: 'john.doe@gmail.com', password: hashedPassword, role: 'customer', phone: '555-CUST1' },
            { name: 'Alice Smith', email: 'alice.smith@gmail.com', password: hashedPassword, role: 'customer', phone: '555-CUST2' },
            { name: 'Charlie Brown', email: 'charlie.brown@gmail.com', password: hashedPassword, role: 'customer', phone: '555-CUST3' }
        ]);

        const adminUser = users.find(u => u.role === 'admin');
        const riderUsers = users.filter(u => u.role === 'rider');
        const restaurantOwners = users.filter(u => u.role === 'restaurant');
        const customerUsers = users.filter(u => u.role === 'customer');

        console.log('✅ Users Created.');

        // -----------------------
        // -----------------------
        // 5. Create Profiles & Data
        // -----------------------

        // Riders
        await Rider.create([
            {
                userId: riderUsers[0]._id, // Alex
                vehicleType: 'scooter',
                vehicleNumber: 'NYC-2024',
                licenseNumber: 'DL-ALEX-123',
                isAvailable: true,
                earnings: 150.50
            },
            {
                userId: riderUsers[1]._id, // Sarah
                vehicleType: 'bike',
                vehicleNumber: 'BK-SARAH-456',
                licenseNumber: 'DL-SARAH-456',
                isAvailable: true,
                earnings: 85.00
            },
            {
                userId: riderUsers[2]._id, // Mike
                vehicleType: 'car',
                vehicleNumber: 'CAR-MIKE-789',
                licenseNumber: 'DL-MIKE-789',
                isAvailable: true,
                earnings: 210.25
            }
        ]);
        console.log('✅ Riders Created.');

        // Restaurants
        const r1 = await Restaurant.create({
            ownerId: restaurantOwners[0]._id,
            name: "Luigi's Pizza Palace",
            cuisine: ['Italian', 'Pizza'],
            rating: 4.8,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            isActive: true
        });

        const r2 = await Restaurant.create({
            ownerId: restaurantOwners[1]._id,
            name: "Hanzo's Sushi Bar",
            cuisine: ['Japanese', 'Sushi'],
            rating: 4.9,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
            isActive: true
        });

        const r3 = await Restaurant.create({
            ownerId: restaurantOwners[2]._id,
            name: "Bob's Burger Joint",
            cuisine: ['American', 'Burgers'],
            rating: 4.6,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
            isActive: true
        });
        console.log('✅ Restaurants Created.');

        // Food Items
        // -- Luigi's --
        await FoodItem.create({ name: 'Pepperoni Pizza', price: 15, category: 'Pizza', restaurantId: r1._id, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e' });
        await FoodItem.create({ name: 'Margherita Pizza', price: 12, category: 'Pizza', restaurantId: r1._id, isVegetarian: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002' });
        await FoodItem.create({ name: 'Tiramisu', price: 8, category: 'Dessert', restaurantId: r1._id, isVegetarian: true });

        // -- Hanzo's --
        await FoodItem.create({ name: 'Dragon Roll', price: 18, category: 'Sushi', restaurantId: r2._id });
        await FoodItem.create({ name: 'Salmon Nigiri', price: 10, category: 'Sushi', restaurantId: r2._id });
        await FoodItem.create({ name: 'Miso Soup', price: 5, category: 'Appetizer', restaurantId: r2._id, isVegetarian: true });

        // -- Bob's --
        await FoodItem.create({ name: 'Classic Cheeseburger', price: 11, category: 'Burgers', restaurantId: r3._id });
        await FoodItem.create({ name: 'Bacon Deluxe', price: 13, category: 'Burgers', restaurantId: r3._id });
        await FoodItem.create({ name: 'Fries', price: 4, category: 'Sides', restaurantId: r3._id, isVegetarian: true });

        console.log('✅ Menu Items Created.');

        console.log('\n🎉 SEEDING COMPLETE! You can login now.');

    } catch (e) {
        console.error('❌ SEED ERROR:', e);
    } finally {
        mongoose.connection.close();
    }
};

seed();
