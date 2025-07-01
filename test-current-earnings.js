const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testCurrentEarnings() {
  try {
    console.log('🔍 Testing current earnings...\n');
    
    // Try to login with an existing user
    console.log('1️⃣ Attempting login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('👤 User info:', {
      id: user.id,
      email: user.email,
      teamId: user.teamId,
      role: user.role
    });
    
    // Check earnings
    console.log('\n2️⃣ Checking earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings result:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCurrentEarnings(); 