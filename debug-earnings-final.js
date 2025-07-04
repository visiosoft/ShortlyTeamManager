const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugEarningsFinal() {
  try {
    console.log('🔍 Debugging earnings API step by step...\n');
    
    // Step 1: Login as adnan@yahoo.com with correct password
    console.log('1️⃣ Logging in as adnan@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('👤 User ID:', user.id);
    console.log('🏢 Team ID:', user.teamId);
    
    // Step 2: Get team info and check rewards
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
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
      return;
    }
    
    // Step 3: Test earnings API without date filter
    console.log('\n3️⃣ Testing earnings API (no date filter)...');
    const earningsResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings response:', earningsResponse.data);
    
    // Step 4: Test earnings API with date filter
    console.log('\n4️⃣ Testing earnings API (with date filter)...');
    const startDate = '2025-06-04';
    const endDate = '2025-07-04';
    
    const earningsWithDateResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings with date filter:', earningsWithDateResponse.data);
    
    // Step 5: Manual calculation verification
    console.log('\n5️⃣ Manual calculation verification:');
    const totalClicks = 15; // From the logs
    const reward = team.rewards[0];
    
    if (reward) {
      const rewardCount = Math.floor(totalClicks / reward.clicks);
      const manualEarnings = rewardCount * reward.amount;
      
      console.log(`   Total clicks: ${totalClicks}`);
      console.log(`   Reward threshold: ${reward.clicks} clicks = ${reward.amount} ${reward.currency}`);
      console.log(`   Rewards earned: ${rewardCount} (${totalClicks} ÷ ${reward.clicks} = ${rewardCount})`);
      console.log(`   Manual earnings: ${manualEarnings} ${reward.currency}`);
      console.log(`   API earnings: ${earningsResponse.data.totalEarnings} ${earningsResponse.data.currency}`);
      console.log(`   Match: ${manualEarnings === earningsResponse.data.totalEarnings ? '✅' : '❌'}`);
      
      if (rewardCount === 0) {
        console.log(`   💡 User needs ${reward.clicks - totalClicks} more clicks to earn first reward`);
      }
    }
    
    // Step 6: Check if clicks are being tracked properly
    console.log('\n6️⃣ Checking analytics data...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Analytics data:', {
      totalClicks: analyticsResponse.data.totalClicks,
      uniqueIPs: analyticsResponse.data.uniqueIPs,
      uniqueCountries: analyticsResponse.data.uniqueCountries
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugEarningsFinal(); 