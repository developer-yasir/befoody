const API_URL = 'http://localhost:5000/api';

const CREDS = { email: 'maria@pizzaparadise.com', password: 'password123' };
const ADMIN_CREDS = { email: 'admin@befoody.com', password: 'admin123' };

// Helpers
const login = async (creds, role) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.log(`✅ Logged in as ${role}: ${creds.email}`);
        return { token: data.token, userId: data.user.id };
    } catch (err) {
        console.error(`❌ Failed to login as ${role}:`, err.message);
        process.exit(1);
    }
};

const run = async () => {
    console.log('🔍 Checking & Fixing Restaurant Link...\n');

    // 1. Check current status
    const maria = await login(CREDS, 'Maria');

    let restaurants = [];
    try {
        const res = await fetch(`${API_URL}/restaurants`, {
            headers: { Authorization: `Bearer ${maria.token}` }
        });
        restaurants = await res.json();
    } catch (err) {
        console.error('❌ Failed to fetch restaurants:', err.message);
    }

    const myRestaurant = restaurants.find(r => r.ownerId === maria.userId);

    if (myRestaurant) {
        console.log(`✅ SUCCESS: Maria is linked to "${myRestaurant.name}"`);
        console.log('If dashboard still fails, check frontend logic.');
        return;
    }

    console.log('❌ PROBLEM: Maria has no linked restaurant.');
    console.log('🔧 Attempting to fix...');

    // 2. Fix it
    const admin = await login(ADMIN_CREDS, 'Admin');

    // Find Pizza Paradise
    const targetRestaurant = restaurants.find(r => r.name === 'Pizza Paradise') || restaurants[0];

    if (!targetRestaurant) {
        console.error('❌ CRITICAL: No restaurants found at all to link!');
        return;
    }

    console.log(`📝 Linking Maria to "${targetRestaurant.name}"...`);

    try {
        // We probably need a specific admin route to update restaurant owner
        // Or simple update restaurant route if admin
        // PUT /api/restaurants/:id
        const res = await fetch(`${API_URL}/restaurants/${targetRestaurant._id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${admin.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...targetRestaurant,
                ownerId: maria.userId
            })
        });

        if (!res.ok) throw new Error(await res.text());
        const updated = await res.json();
        console.log(`✅ FIXED: Linked "${updated.name}" to Maria (ID: ${maria.userId})`);

    } catch (err) {
        console.error('❌ Failed to update restaurant:', err.message);
    }
};

run();
