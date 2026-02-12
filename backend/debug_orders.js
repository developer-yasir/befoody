const API_URL = 'http://localhost:5000/api';

const ADMIN_CREDS = { email: 'admin@befoody.com', password: 'admin123' };

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
    console.log('🔍 Debugging Orders & Restaurants...\n');
    const token = await login();
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Restaurants
    const rRes = await fetch(`${API_URL}/restaurants`, { headers });
    const restaurants = await rRes.json();
    console.log('📋 Restaurants:');
    const rMap = {};
    restaurants.forEach(r => {
        console.log(`- [${r._id}] ${r.name} (Owner: ${r.ownerId})`);
        rMap[r._id] = r.name;
    });

    // Fetch All Orders
    const oRes = await fetch(`${API_URL}/orders/admin/all`, { headers });
    const orders = await oRes.json();

    console.log('\n📦 Recent Orders (Last 5):');
    orders.slice(0, 5).forEach(o => {
        const rName = rMap[o.restaurantId?._id || o.restaurantId] || 'UNKNOWN';
        console.log(`- Subtotal: ${o.totalAmount} | Status: ${o.status} | Rest: ${rName} (${o.restaurantId?._id || o.restaurantId})`);
    });
};

run();
