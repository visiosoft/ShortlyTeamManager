const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRewards() {
  try {
    // First, let's login as an admin
    console.log('🔍 Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Get team info
    console.log('🔍 Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Team info:', teamResponse.data);
    
    // Set up some rewards
    console.log('🔍 Setting up rewards...');
    const rewardsResponse = await axios.post(`${BASE_URL}/teams/${teamResponse.data._id}/rewards`, {
      rewards: [
        { clicks: 100, amount: 50, currency: 'PKR' },
        { clicks: 500, amount: 250, currency: 'PKR' },
        { clicks: 1000, amount: 600, currency: 'PKR' }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Rewards set up:', rewardsResponse.data);
    
    // Check earnings
    console.log('🔍 Checking earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Earnings:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRewards(); 