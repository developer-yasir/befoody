const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/befoody')
    .then(() => console.log('✅ Connected to MongoDB')).catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define User Schema (minimal)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false }); // schema-less for simplicity

const User = mongoose.model('User', userSchema);

const fixRole = async () => {
    try {
        const email = 'alex.rider@befoody.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User ${email} not found.`);
        } else {
            console.log(`👤 Found user: ${user.name}`);
            console.log(`   Current Role: ${user.role}`);

            if (user.role !== 'rider') {
                user.role = 'rider';
                await user.save();
                console.log(`✅ Role successfully updated to 'rider'.`);
            } else {
                console.log(`✅ Role is already correct.`);
            }
        }
    } catch (err) {
        console.error('❌ Error updating role:', err);
    } finally {
        mongoose.connection.close();
    }
};

fixRole();
