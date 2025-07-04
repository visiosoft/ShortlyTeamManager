const axios = require('axios');

const BASE_URL = 'http://localhost:3009';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendLogin() {
  try {
    console.log('🔍 Testing frontend login flow...\n');
    
    // Step 1: Login via API
    console.log('1️⃣ Logging in via API...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   - Token received:', !!token);
    
    // Step 2: Check if frontend is accessible
    console.log('\n2️⃣ Checking frontend accessibility...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log('✅ Frontend is accessible');
    } catch (error) {
      console.log('❌ Frontend is not accessible:', error.message);
      return;
    }
    
    // Step 3: Test my-clicks endpoint with token
    console.log('\n3️⃣ Testing my-clicks data with token...');
    try {
      const myClicksResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ My-clicks data accessible with token');
      console.log('   - Total clicks:', myClicksResponse.data.totalClicks);
    } catch (error) {
      console.log('❌ My-clicks data not accessible:', error.response?.data || error.message);
    }
    
    // Step 4: Test team rewards with token
    console.log('\n4️⃣ Testing team rewards with token...');
    try {
      const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Team rewards accessible with token');
      console.log('   - Has rewards:', !!teamResponse.data.rewards);
      console.log('   - Rewards count:', teamResponse.data.rewards ? teamResponse.data.rewards.length : 0);
    } catch (error) {
      console.log('❌ Team rewards not accessible:', error.response?.data || error.message);
    }
    
    // Step 5: Instructions for user
    console.log('\n5️⃣ Instructions for frontend testing:');
    console.log('   - Open browser and go to: http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to: http://localhost:3000/my-clicks');
    console.log('   - Check browser console for debug logs');
    console.log('   - If still showing "No Rewards Configured", check:');
    console.log('     * Browser console for errors');
    console.log('     * Network tab for failed API calls');
    console.log('     * Local storage for token');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendLogin(); 