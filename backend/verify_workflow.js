const API_URL = 'http://localhost:5000/api';

// Credentials
const ADMIN_CREDS = { email: 'admin@befoody.com', password: 'admin123' };
const RESTAURANT_CREDS = { email: 'maria@pizzaparadise.com', password: 'password123' };
const RIDER_CREDS = { email: 'alex.rider@befoody.com', password: 'password123' };

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
        return data.token;
    } catch (err) {
        console.error(`❌ Failed to login as ${role}:`, err.message);
        process.exit(1);
    }
};

const run = async () => {
    console.log('🚀 Starting End-to-End Workflow Verification...\n');

    // 1. Login as Admin to find Pizza Paradise ID
    const adminToken = await login(ADMIN_CREDS, 'Admin');

    // 2. Fetch Restaurants
    let pizzaParadiseId;
    try {
        const res = await fetch(`${API_URL}/restaurants`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const restaurants = await res.json();
        const restaurant = restaurants.find(r => r.name === 'Pizza Paradise');
        if (!restaurant) throw new Error('Pizza Paradise not found');
        pizzaParadiseId = restaurant._id;
        console.log(`✅ Found Pizza Paradise ID: ${pizzaParadiseId}`);
    } catch (err) {
        console.error('❌ Failed to fetch restaurants:', err.message);
        process.exit(1);
    }

    // 3. Place Guest Order
    let orderId;
    try {
        const foodRes = await fetch(`${API_URL}/fooditems?restaurantId=${pizzaParadiseId}`);
        if (!foodRes.ok) throw new Error(await foodRes.text());
        const foodItems = await foodRes.json();
        const foodItem = foodItems[0];
        if (!foodItem) throw new Error('No food items found for Pizza Paradise');

        const orderData = {
            restaurantId: pizzaParadiseId,
            items: [{
                foodItemId: foodItem._id,
                name: foodItem.name,
                price: foodItem.price,
                quantity: 2
            }],
            totalAmount: (foodItem.price * 2) + 2.99,
            deliveryFee: 2.99,
            deliveryAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            paymentMethod: 'cash',
            guestInfo: {
                name: 'Guest Tester',
                email: 'guest@test.com',
                phone: '555-0123'
            }
        };

        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!orderRes.ok) throw new Error(await orderRes.text());
        const order = await orderRes.json();
        orderId = order._id;
        console.log(`✅ Guest Order Placed! Order ID: ${orderId}`);
        console.log(`   Tracking URL should be: /track-order/${orderId}`);
    } catch (err) {
        console.error('❌ Failed to place order:', err.message);
        process.exit(1);
    }

    // 4. Login as Restaurant Owner (Maria)
    const restaurantToken = await login(RESTAURANT_CREDS, 'Restaurant Owner');

    // 5. Fetch Restaurant Orders
    try {
        const res = await fetch(`${API_URL}/orders/restaurant/${pizzaParadiseId}`, {
            headers: { Authorization: `Bearer ${restaurantToken}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const orders = await res.json();
        const myOrder = orders.find(o => o._id === orderId);
        if (!myOrder) throw new Error('Placed order not found in restaurant dashboard');
        console.log(`✅ Order visible in Restaurant Dashboard (New Endpoint Verified)`);
    } catch (err) {
        console.error('❌ Failed to fetch restaurant orders:', err.message);
        process.exit(1);
    }

    // 6. Process Order
    try {
        const headers = {
            Authorization: `Bearer ${restaurantToken}`,
            'Content-Type': 'application/json'
        };

        const updateStatus = async (status) => {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error(await res.text());
            console.log(`✅ Order Status Updated: ${status}`);
        };

        await updateStatus('confirmed');
        await updateStatus('preparing');
        await updateStatus('ready_for_pickup');
    } catch (err) {
        console.error('❌ Failed to process order:', err.message);
        process.exit(1);
    }

    // 7. Login as Rider (Alex)
    const riderToken = await login(RIDER_CREDS, 'Rider');

    // 8. Fetch Available Orders
    try {
        const res = await fetch(`${API_URL}/riders/available-orders`, {
            headers: { Authorization: `Bearer ${riderToken}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const orders = await res.json();
        const myOrder = orders.find(o => o._id === orderId);
        if (!myOrder) throw new Error('Order not found in available orders for rider');
        console.log(`✅ Order visible to Rider`);
    } catch (err) {
        console.error('❌ Failed to fetch available orders:', err.message);
        process.exit(1);
    }

    // 9. Accept Order
    try {
        const res = await fetch(`${API_URL}/riders/accept-order/${orderId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${riderToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        if (!res.ok) throw new Error(await res.text());
        console.log('✅ Rider Accepted Order');
    } catch (err) {
        console.error('❌ Rider failed to accept order:', err.message);
        process.exit(1);
    }

    // 10. Deliver Order
    try {
        const headers = {
            Authorization: `Bearer ${riderToken}`,
            'Content-Type': 'application/json'
        };

        const updateStatus = async (status) => {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error(await res.text());
            console.log(`✅ Order Status Updated: ${status}`);
        };

        await updateStatus('out_for_delivery');

        const res = await fetch(`${API_URL}/riders/complete-delivery/${orderId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({})
        });
        if (!res.ok) throw new Error(await res.text());
        console.log('✅ Order Delivered! 🏁');
    } catch (err) {
        console.error('❌ Rider failed to complete delivery:', err.message);
        process.exit(1);
    }

    console.log('\n✨ E2E Workflow Verification SUCCESSFUL! ✨');
};

run();
