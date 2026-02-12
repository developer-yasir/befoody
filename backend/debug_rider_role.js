const API_URL = 'http://localhost:5000/api';
const ADMIN_CREDS = { email: 'admin@befoody.com', password: 'admin123' };
const RIDER_EMAIL = 'alex.rider@befoody.com';

const login = async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_CREDS)
    });
    const data = await res.json();
    return data.token;
};

const run = async () => {
    console.log('🔍 Checking Rider Role...\n');
    const token = await login();

    // Fetch all users (admin only)
    const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error('❌ Failed to fetch users:', await res.text());
        return;
    }

    const users = await res.json();
    const rider = users.find(u => u.email === RIDER_EMAIL);

    if (!rider) {
        console.log(`❌ User ${RIDER_EMAIL} not found!`);
    } else {
        console.log(`👤 User: ${rider.name} (${rider.email})`);
        console.log(`🏷️ Role: ${rider.role}`);

        if (rider.role !== 'rider') {
            console.log('❌ Role mismatch! Attempting to fix...');
            // Fix it
            // Assumption: We have a route to update user role or generic user update
            // api/users/:id
            const updateRes = await fetch(`${API_URL}/users/${rider._id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: 'rider' })
            });

            if (updateRes.ok) {
                const updated = await updateRes.json();
                console.log(`✅ FIXED: Role updated to ${updated.role}`);
            } else {
                console.error('❌ Failed to update role:', await updateRes.text());
            }
        } else {
            console.log('✅ Role is correct.');
        }
    }
};

run();
