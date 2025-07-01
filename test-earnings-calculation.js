const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEarningsCalculation() {
  try {
    console.log('🔍 Testing earnings calculation...\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Get team info
    console.log('\n🔍 Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team rewards:', team.rewards);
    
    // Get user URLs
    console.log('\n🔍 Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const urls = urlsResponse.data.urls;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    console.log(`📊 Total clicks: ${totalClicks}`);
    
    // Manual calculation
    console.log('\n🧮 Manual calculation:');
    if (team.rewards && team.rewards.length > 0) {
      let manualEarnings = 0;
      let breakdown = [];
      let remainingClicks = totalClicks;
      
      const sortedRewards = [...team.rewards].sort((a, b) => b.clicks - a.clicks);
      
      for (const reward of sortedRewards) {
        if (remainingClicks >= reward.clicks) {
          const rewardCount = Math.floor(remainingClicks / reward.clicks);
          const earnedAmount = rewardCount * reward.amount;
          
          breakdown.push({
            clicks: reward.clicks * rewardCount,
            amount: earnedAmount,
            currency: reward.currency
          });
          
          manualEarnings += earnedAmount;
          remainingClicks = remainingClicks % reward.clicks;
        }
      }
      
      console.log(`   Expected earnings: ${manualEarnings} PKR`);
      console.log(`   Breakdown:`, breakdown);
    } else {
      console.log('   No rewards configured');
    }
    
    // Check actual earnings
    console.log('\n🔍 Checking actual earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Actual earnings:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEarningsCalculation(); 