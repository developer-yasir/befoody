const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login for alex.rider@befoody.com...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'alex.rider@befoody.com',
            password: 'password123'
        });

        console.log('✅ Login Successful!');
        console.log('User ID:', response.data.user.id);
        console.log('User Name:', response.data.user.name);
        console.log('User Role:', response.data.user.role);
        console.log('Token received:', response.data.token ? 'Yes' : 'No');

    } catch (error) {
        console.error('❌ Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
