const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEarningsSimple() {
  try {
    console.log('🔍 Testing earnings endpoint...\n');
    
    // Step 1: Login as adnan@yahoo.com
    console.log('1️⃣ Logging in as adnan@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Test earnings endpoint
    console.log('\n2️⃣ Testing earnings endpoint...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings response:', earningsResponse.data);
    
    // Step 3: Test with date filter
    console.log('\n3️⃣ Testing earnings with date filter...');
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    const earningsWithDateResponse = await axios.get(`${BASE_URL}/teams/my-earnings?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings with date filter:', earningsWithDateResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEarningsSimple(); 