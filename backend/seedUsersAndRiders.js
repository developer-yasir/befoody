const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Rider = require('./models/Rider');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

const restaurantOwners = [
    {
        name: 'Maria Garcia',
        email: 'maria@pizzaparadise.com',
        password: 'password123',
        role: 'restaurant',
        phone: '555-0201'
    },
    {
        name: 'Kenji Tanaka',
        email: 'kenji@sushimaster.com',
        password: 'password123',
        role: 'restaurant',
        phone: '555-0202'
    },
    {
        name: 'John Smith',
        email: 'john@burgerhouse.com',
        password: 'password123',
        role: 'restaurant',
        phone: '555-0203'
    }
];

const riders = [
    {
        user: {
            name: 'Alex Johnson',
            email: 'alex.rider@befoody.com',
            password: 'password123',
            role: 'customer',
            phone: '555-0301'
        },
        riderInfo: {
            vehicleType: 'bike',
            vehicleNumber: 'BK-1234',
            licenseNumber: 'DL-12345678'
        }
    },
    {
        user: {
            name: 'Sarah Williams',
            email: 'sarah.rider@befoody.com',
            password: 'password123',
            role: 'customer',
            phone: '555-0302'
        },
        riderInfo: {
            vehicleType: 'scooter',
            vehicleNumber: 'SC-5678',
            licenseNumber: 'DL-23456789'
        }
    },
    {
        user: {
            name: 'Mike Chen',
            email: 'mike.rider@befoody.com',
            password: 'password123',
            role: 'customer',
            phone: '555-0303'
        },
        riderInfo: {
            vehicleType: 'bicycle',
            vehicleNumber: 'BC-9012',
            licenseNumber: 'DL-34567890'
        }
    },
    {
        user: {
            name: 'Emily Brown',
            email: 'emily.rider@befoody.com',
            password: 'password123',
            role: 'customer',
            phone: '555-0304'
        },
        riderInfo: {
            vehicleType: 'car',
            vehicleNumber: 'CAR-3456',
            licenseNumber: 'DL-45678901'
        }
    }
];

async function seedUsersAndRiders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        let restaurantOwnersCreated = 0;
        let ridersCreated = 0;

        // Create restaurant owners
        console.log('\n📍 Creating Restaurant Owners...');
        for (const ownerData of restaurantOwners) {
            const existingUser = await User.findOne({ email: ownerData.email });
            if (existingUser) {
                console.log(`⚠️  User ${ownerData.email} already exists, skipping...`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(ownerData.password, salt);
            const user = await User.create({
                ...ownerData,
                password: hashedPassword
            });
            restaurantOwnersCreated++;
            console.log(`✅ Created restaurant owner: ${user.name} (${user.email})`);
        }

        // Create riders
        console.log('\n🚴 Creating Delivery Riders...');
        for (const riderData of riders) {
            const existingUser = await User.findOne({ email: riderData.user.email });
            if (existingUser) {
                console.log(`⚠️  User ${riderData.user.email} already exists, skipping...`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(riderData.user.password, salt);
            const user = await User.create({
                ...riderData.user,
                password: hashedPassword
            });

            const rider = await Rider.create({
                userId: user._id,
                ...riderData.riderInfo
            });
            ridersCreated++;
            console.log(`✅ Created rider: ${user.name} (${user.email}) - ${rider.vehicleType}`);
        }

        // Update existing restaurants to have restaurant owner IDs
        console.log('\n🏪 Updating Restaurant Ownership...');
        const restaurants = await Restaurant.find();
        const restaurantUsers = await User.find({ role: 'restaurant' });

        if (restaurantUsers.length > 0) {
            for (let i = 0; i < Math.min(restaurants.length, restaurantUsers.length); i++) {
                restaurants[i].ownerId = restaurantUsers[i]._id;
                await restaurants[i].save();
                console.log(`✅ Assigned ${restaurants[i].name} to ${restaurantUsers[i].name}`);
            }
        }

        console.log('\n🎉 Seeding Complete!');
        console.log('-----------------------------------');
        console.log(`👥 Restaurant Owners Created: ${restaurantOwnersCreated}`);
        console.log(`🚴 Delivery Riders Created: ${ridersCreated}`);
        console.log('-----------------------------------');
        console.log('\n📝 Login Credentials:');
        console.log('\nRestaurant Owners:');
        restaurantOwners.forEach(owner => {
            console.log(`  ${owner.name}: ${owner.email} / password123`);
        });
        console.log('\nDelivery Riders:');
        riders.forEach(rider => {
            console.log(`  ${rider.user.name}: ${rider.user.email} / password123`);
        });
        console.log('\n-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsersAndRiders();
