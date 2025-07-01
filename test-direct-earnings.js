const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testDirectEarnings() {
  try {
    console.log('🔍 Testing direct earnings call...\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // Decode JWT to see payload
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('🔍 JWT Payload:', JSON.stringify(payload, null, 2));
    
    // Call earnings endpoint
    console.log('\n🔍 Calling earnings endpoint...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings response:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testDirectEarnings(); 