const axios = require('axios');

const BASE_URL = 'http://localhost:3009';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendRewards() {
  try {
    console.log('🔍 Testing frontend rewards detection...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Get team info (simulates fetchTeamRewards)
    console.log('\n2️⃣ Getting team info (fetchTeamRewards)...');
    const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team data:');
    console.log('   - Has rewards:', !!team.rewards);
    console.log('   - Rewards length:', team.rewards ? team.rewards.length : 0);
    console.log('   - Rewards:', JSON.stringify(team.rewards, null, 2));
    
    // Step 3: Get clicks data (simulates fetchMyTotalClicks)
    console.log('\n3️⃣ Getting clicks data (fetchMyTotalClicks)...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = analyticsResponse.data;
    console.log('📊 Clicks data:');
    console.log('   - Total clicks:', data.totalClicks);
    console.log('   - Has data:', !!data);
    
    // Step 4: Simulate frontend conditions
    console.log('\n4️⃣ Frontend conditions check:');
    const hasRewards = team.rewards && team.rewards.length > 0;
    const hasData = !!data;
    
    console.log('   - team.rewards exists:', !!team.rewards);
    console.log('   - team.rewards.length > 0:', team.rewards ? team.rewards.length > 0 : false);
    console.log('   - data exists:', !!data);
    console.log('   - data.totalClicks exists:', data ? !!data.totalClicks : false);
    
    console.log('\n5️⃣ Condition evaluation:');
    console.log('   - hasRewards:', hasRewards);
    console.log('   - hasData:', hasData);
    console.log('   - Both conditions met:', hasRewards && hasData);
    
    if (hasRewards && hasData) {
      console.log('✅ Should show predicted earnings');
      const reward = team.rewards[0];
      const threshold = reward.clicks;
      const rewardAmount = reward.amount;
      const currency = reward.currency;
      const totalClicks = data.totalClicks;
      
      const earningsPerClick = rewardAmount / threshold;
      const currentEarnings = totalClicks * earningsPerClick;
      
      console.log('   - Threshold:', threshold);
      console.log('   - Reward amount:', rewardAmount);
      console.log('   - Currency:', currency);
      console.log('   - Earnings per click:', earningsPerClick);
      console.log('   - Current earnings:', currentEarnings);
    } else {
      console.log('❌ Should show placeholder');
      if (!hasRewards) console.log('   - Reason: No rewards configured');
      if (!hasData) console.log('   - Reason: No clicks data');
    }
    
    // Step 5: Check if frontend is running
    console.log('\n6️⃣ Checking frontend availability...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log('✅ Frontend is running');
    } catch (error) {
      console.log('❌ Frontend is not running or not accessible');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendRewards(); 