const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/befoody')
    .then(() => console.log('✅ Connected to MongoDB')).catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const riderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAvailable: Boolean
}, { strict: false });

const User = mongoose.model('User', userSchema);
const Rider = mongoose.model('Rider', riderSchema);

const fixAllRiders = async () => {
    try {
        const riders = await Rider.find({});
        console.log(`🔍 Found ${riders.length} rider profiles.`);

        for (const rider of riders) {
            console.log(`\n🚴 Checking Rider Profile ID: ${rider._id}`);
            if (!rider.userId) {
                console.log('   ⚠️ Rider profile has no userId link.');
                continue;
            }

            const user = await User.findById(rider.userId);
            if (!user) {
                console.log(`   ❌ Linked User ID ${rider.userId} NOT FOUND.`);
            } else {
                console.log(`   👤 Found User: ${user.name} (${user.email})`);
                console.log(`      Current Role: ${user.role}`);

                if (user.role !== 'rider') {
                    user.role = 'rider';
                    await user.save();
                    console.log(`      ✅ FIXED: Role updated to 'rider'.`);
                } else {
                    console.log(`      ✅ Role is correct.`);
                }
            }
        }

    } catch (err) {
        console.error('❌ Error fixing riders:', err);
    } finally {
        mongoose.connection.close();
    }
};

fixAllRiders();
