const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Rider = require('./models/Rider');
require('dotenv').config();

const riders = [
    {
        user: {
            name: 'Alex Johnson',
            email: 'alex.rider@befoody.com',
            password: 'password123',
            role: 'rider', // Explicitly setting role to 'rider'
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
            role: 'rider',
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
            role: 'rider',
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
            role: 'rider',
            phone: '555-0304'
        },
        riderInfo: {
            vehicleType: 'car',
            vehicleNumber: 'CAR-3456',
            licenseNumber: 'DL-45678901'
        }
    }
];

async function seedRiders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        let ridersCreated = 0;

        // Create riders
        console.log('\n🚴 Creating Delivery Riders...');
        for (const riderData of riders) {
            let user = await User.findOne({ email: riderData.user.email });

            if (user) {
                console.log(`⚠️  User ${riderData.user.email} already exists.`);
                if (user.role !== 'rider') {
                    console.log(`   Updating role to 'rider'...`);
                    user.role = 'rider';
                    await user.save();
                }
            } else {
                const hashedPassword = await bcrypt.hash(riderData.user.password, salt);
                user = await User.create({
                    ...riderData.user,
                    password: hashedPassword
                });
                console.log(`✅ Created user: ${user.name} (${user.email})`);
            }

            // Check if Rider profile exists
            const existingRider = await Rider.findOne({ userId: user._id });
            if (!existingRider) {
                const rider = await Rider.create({
                    userId: user._id,
                    ...riderData.riderInfo
                });
                ridersCreated++;
                console.log(`✅ Created rider profile for: ${user.name}`);
            } else {
                console.log(`ℹ️  Rider profile already exists for ${user.name}`);
            }
        }

        console.log('\n🎉 Rider Seeding Complete!');
        console.log('-----------------------------------');
        console.log(`🚴 New Rider Profiles Created: ${ridersCreated}`);
        console.log('-----------------------------------');
        console.log('\n📝 Login Credentials:');
        riders.forEach(rider => {
            console.log(`  ${rider.user.name}: ${rider.user.email} / password123`);
        });
        console.log('\n-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding riders:', error);
        process.exit(1);
    }
}

seedRiders();
