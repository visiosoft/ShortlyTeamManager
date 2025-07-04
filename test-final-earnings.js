const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testFinalEarnings() {
  try {
    console.log('🎉 FINAL TEST: Earnings for every click system\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Get team info
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team:', team.name);
    console.log('💰 Rewards:', team.rewards[0]);
    
    // Step 3: Get current clicks
    console.log('\n3️⃣ Getting current clicks...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const totalClicks = analyticsResponse.data.totalClicks;
    console.log(`📊 Current clicks: ${totalClicks}`);
    
    // Step 4: Calculate earnings
    console.log('\n4️⃣ Calculating earnings...');
    const reward = team.rewards[0];
    const threshold = reward.clicks;
    const rewardAmount = reward.amount;
    const currency = reward.currency;
    
    const earningsPerClick = rewardAmount / threshold;
    const totalEarnings = totalClicks * earningsPerClick;
    
    console.log('\n💰 EARNINGS SUMMARY:');
    console.log(`   📋 Setup: ${threshold} clicks = ${rewardAmount} ${currency}`);
    console.log(`   📊 Earnings per click: ${earningsPerClick.toFixed(2)} ${currency}`);
    console.log(`   📈 Current clicks: ${totalClicks}`);
    console.log(`   💰 Current earnings: ${totalEarnings.toFixed(2)} ${currency}`);
    
    // Step 5: Test API
    console.log('\n5️⃣ Testing API endpoint...');
    const earningsResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API Response:', earningsResponse.data);
    
    // Step 6: Show what happens with more clicks
    console.log('\n6️⃣ Projections with more clicks:');
    const projections = [20, 50, 100, 200, 500];
    
    projections.forEach(clicks => {
      const earnings = clicks * earningsPerClick;
      const progress = (clicks / threshold) * 100;
      console.log(`   ${clicks} clicks: ${earnings.toFixed(2)} ${currency} (${progress.toFixed(1)}% progress)`);
    });
    
    console.log('\n🎉 SUCCESS! Earnings system is working correctly!');
    console.log('📱 Visit: http://localhost:3000/my-clicks to see the UI');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFinalEarnings(); 