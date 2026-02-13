const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody';
console.log('Script connecting to:', uri);

mongoose.connect(uri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

const listUsers = async () => {
    try {
        const users = await User.find({});
        console.log(`\nFound ${users.length} TOTAL users in this database:`);

        users.forEach(u => {
            console.log(` - ID: ${u._id} | Email: ${u.email} | Role: ${u.role}`);
        });

        console.log('\nLooking specifically for "alex.rider@befoody.com":');
        const riders = users.filter(u => u.email === 'alex.rider@befoody.com');
        riders.forEach(r => {
            console.log(`MATCH: ID: ${r._id} | Email: ${r.email} | Role: ${r.role}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

listUsers();
