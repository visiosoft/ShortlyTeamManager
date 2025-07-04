const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugStep2() {
  try {
    console.log('🔍 Step 2: Testing earnings calculation...\n');
    
    // Login as adnan@yahoo.com
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Get team info
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team rewards:', team.rewards || 'No rewards');
    
    // Test earnings API
    console.log('\n💰 Testing earnings API...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 API Response:', earningsResponse.data);
    
    // Manual calculation verification
    if (team.rewards && team.rewards.length > 0) {
      console.log('\n🧮 Manual calculation verification:');
      const totalClicks = 15; // From the logs
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
      
      console.log(`   Total clicks: ${totalClicks}`);
      console.log(`   Manual earnings: ${manualEarnings} ${team.rewards[0]?.currency || 'PKR'}`);
      console.log(`   API earnings: ${earningsResponse.data.totalEarnings} ${earningsResponse.data.currency}`);
      console.log(`   Match: ${manualEarnings === earningsResponse.data.totalEarnings ? '✅' : '❌'}`);
      console.log(`   Breakdown:`, breakdown);
    } else {
      console.log('❌ No rewards configured - earnings will always be 0');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugStep2(); 