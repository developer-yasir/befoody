const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/befoody')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

const fixDuplicates = async () => {
    try {
        const email = 'alex.rider@befoody.com';
        console.log(`🔍 Checking for duplicates for email: ${email}`);

        const users = await User.find({ email: email });
        console.log(`Found ${users.length} users with this email:`);

        users.forEach(u => {
            console.log(` - ID: ${u._id}, Role: ${u.role}, Name: ${u.name}`);
        });

        if (users.length > 1) {
            console.log('\n⚠️ Duplicates found! Removing non-rider accounts...');

            for (const user of users) {
                if (user.role !== 'rider') {
                    console.log(`🗑️ Deleting user ${user._id} (Role: ${user.role})`);
                    await User.findByIdAndDelete(user._id);
                } else {
                    console.log(`✅ Keeping user ${user._id} (Role: ${user.role})`);
                }
            }
            console.log('✨ Cleanup complete.');
        } else {
            console.log('✅ No duplicates found.');
            if (users.length === 1 && users[0].role !== 'rider') {
                console.log(`⚠️ User exists but has wrong role: ${users[0].role}. Updating to 'rider'...`);
                users[0].role = 'rider';
                await users[0].save();
                console.log('✅ Role updated.');
            }
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

fixDuplicates();
