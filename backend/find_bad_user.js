const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/befoody';
console.log('Connecting to:', uri);

mongoose.connect(uri)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

const findAndKill = async () => {
    try {
        const badId = '698db0f18e16307a2b53dd31'; // From frontend log
        console.log(`Looking for user with ID: ${badId}`);

        const user = await User.findById(badId);
        if (user) {
            console.log(`✅ FOUND USER!`);
            console.log(` - ID: ${user._id}`);
            console.log(` - Email: ${user.email}`);
            console.log(` - Role: ${user.role}`);

            console.log('Deleting...');
            await User.findByIdAndDelete(badId);
            console.log('✅ DELETED.');
        } else {
            console.log('❌ User NOT found with this ID in this database.');

            // List all databases to be sure
            const admin = mongoose.connection.db.admin();
            const dbs = await admin.listDatabases();
            console.log('\nAvailable Databases:');

            for (const dbInfo of dbs.databases) {
                console.log(`Checking DB: ${dbInfo.name}`);
                if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;

                const client = await mongoose.createConnection(`mongodb://localhost:27017/${dbInfo.name}`).asPromise();
                const OtherUser = client.model('User', userSchema);

                const found = await OtherUser.findById(badId);
                if (found) {
                    console.log(`\n🎉 FOUND IT IN DB: ${dbInfo.name} !!!`);
                    console.log(`Deleting from ${dbInfo.name}...`);
                    await OtherUser.findByIdAndDelete(badId);
                    console.log('✅ DELETED.');
                    await client.close();
                    break;
                }

                // Also check by email to match duplicates
                const byEmail = await OtherUser.findOne({ email: 'alex.rider@befoody.com' });
                if (byEmail && byEmail._id.toString() !== badId) {
                    console.log(`   Found alex.rider in ${dbInfo.name} but with ID: ${byEmail._id} (Role: ${byEmail.role})`);
                }

                await client.close();
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

findAndKill();
