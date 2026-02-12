async function testGuestCheckout() {
    try {
        const orderData = {
            restaurantId: '698d87692093d4668000c1eb', // Use a valid ID from your seed data if possible, or this specific one
            items: [
                {
                    foodItemId: '698d87692093d4668000c1f5', // Example Item ID
                    name: 'Samosas',
                    price: 5.99,
                    quantity: 2
                }
            ],
            totalAmount: 22.96,
            deliveryFee: 2.99,
            deliveryAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            paymentMethod: 'cash',
            guestInfo: {
                name: 'Test Guest',
                email: 'guest@test.com',
                phone: '1234567890'
            }
        };

        console.log('Sending order request...');
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error creating order:');
            console.error('Status:', response.status);
            console.error('Data:', data);
        } else {
            console.log('Order created successfully:', data);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
}

testGuestCheckout();
