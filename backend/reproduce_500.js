const axios = require('axios');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThlY2Y1YzYyY2Y0M2MyYzgzYTRjYzMiLCJyb2xlIjoicmlkZXIiLCJpYXQiOjE3NzA5NjcwNzgsImV4cCI6MTc3MTU3MTg3OH0.fVaYwhyQ3fViHuK8n331eE8oXiBLgeNDD7vakWBAMos";
const orderId = "698ececda536cf1f378c9db9";
const url = `https://befoody.onrender.com/api/riders/accept-order/${orderId}`;

const run = async () => {
    try {
        console.log(`Sending POST to ${url}`);
        const response = await axios.post(url, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.log("❌ Status:", error.response.status);
            console.log("❌ Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("❌ Error:", error.message);
        }
    }
};

run();
