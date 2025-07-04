const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugStep1() {
  try {
    console.log('🔍 Step 1: Checking if rewards are set...\n');
    
    // Login as adnan@yahoo.com
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    
    // Get team info
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team info:');
    console.log('   - Team ID:', team._id);
    console.log('   - Team Name:', team.name);
    console.log('   - Rewards:', team.rewards || 'No rewards configured');
    
    if (team.rewards && team.rewards.length > 0) {
      console.log('✅ Rewards are configured!');
      team.rewards.forEach((reward, index) => {
        console.log(`   ${index + 1}. ${reward.clicks} clicks = ${reward.amount} ${reward.currency}`);
      });
    } else {
      console.log('❌ No rewards configured! This is why earnings are 0.');
      console.log('💡 Solution: Login as admin and set up rewards at /rewards page');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugStep1(); 