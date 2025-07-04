const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugRewardsIssue() {
  try {
    console.log('🔍 Debugging rewards detection issue...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    
    // Step 2: Get team info
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team info:');
    console.log('   - Team ID:', team._id);
    console.log('   - Team Name:', team.name);
    console.log('   - Has rewards:', !!team.rewards);
    console.log('   - Rewards length:', team.rewards ? team.rewards.length : 0);
    console.log('   - Rewards data:', JSON.stringify(team.rewards, null, 2));
    
    // Step 3: Get clicks data
    console.log('\n3️⃣ Getting clicks data...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = analyticsResponse.data;
    console.log('📊 Clicks data:');
    console.log('   - Total clicks:', data.totalClicks);
    console.log('   - Has data:', !!data);
    
    // Step 4: Simulate frontend logic
    console.log('\n4️⃣ Simulating frontend logic...');
    
    const hasRewards = team.rewards && team.rewards.length > 0;
    const hasData = !!data;
    
    console.log('   - Has rewards:', hasRewards);
    console.log('   - Has data:', hasData);
    console.log('   - Both conditions met:', hasRewards && hasData);
    
    if (hasRewards && hasData) {
      console.log('✅ Should show rewards data');
      const reward = team.rewards[0];
      console.log('   - Reward threshold:', reward.clicks);
      console.log('   - Reward amount:', reward.amount);
      console.log('   - Reward currency:', reward.currency);
    } else {
      console.log('❌ Should show placeholder');
      if (!hasRewards) console.log('   - Reason: No rewards configured');
      if (!hasData) console.log('   - Reason: No clicks data');
    }
    
    // Step 5: Check API endpoints
    console.log('\n5️⃣ Checking API endpoints...');
    console.log('   - Team endpoint:', `${BASE_URL}/api/teams/my-team`);
    console.log('   - Analytics endpoint:', `${BASE_URL}/api/analytics/my-total-clicks`);
    
    // Step 6: Test frontend conditions
    console.log('\n6️⃣ Frontend conditions check:');
    console.log('   - team.rewards exists:', !!team.rewards);
    console.log('   - team.rewards.length > 0:', team.rewards ? team.rewards.length > 0 : false);
    console.log('   - data exists:', !!data);
    console.log('   - data.totalClicks exists:', data ? !!data.totalClicks : false);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugRewardsIssue(); 