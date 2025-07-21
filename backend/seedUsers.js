const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing users (optional, for clean seeding)
    await User.deleteMany({});
    console.log('Existing users cleared');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin',
        address: '123 Admin St',
        phone: '111-222-3333',
      },
      {
        name: 'Restaurant Owner',
        email: 'restaurant@example.com',
        password: 'restaurantpassword',
        role: 'restaurant',
        address: '456 Restaurant Ave',
        phone: '444-555-6666',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'userpassword',
        role: 'user',
        address: '789 User Rd',
        phone: '777-888-9999',
      },
    ];

    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await User.create(user);
      console.log(`User ${user.email} created`);
    }

    console.log('Users seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
