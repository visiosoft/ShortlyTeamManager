const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEarningsNoThreshold() {
  try {
    console.log('🔍 Testing earnings for every click (no threshold requirement)...\n');
    
    // Step 1: Login as adnan@yahoo.com
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
    
    // Step 2: Get team info
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team info:');
    console.log('   - Team ID:', team._id);
    console.log('   - Team Name:', team.name);
    console.log('   - Current Rewards:', team.rewards || 'No rewards configured');
    
    // Step 3: Get current clicks
    console.log('\n3️⃣ Getting current clicks...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const totalClicks = analyticsResponse.data.totalClicks;
    console.log(`📊 Current clicks: ${totalClicks}`);
    
    // Step 4: Calculate new earnings (for every click)
    console.log('\n4️⃣ Calculating earnings for every click...');
    
    if (team.rewards && team.rewards.length > 0) {
      const reward = team.rewards[0];
      const threshold = reward.clicks;
      const rewardAmount = reward.amount;
      const currency = reward.currency;
      
      console.log(`📋 Reward setup: ${threshold} clicks = ${rewardAmount} ${currency}`);
      
      // New calculation: earnings for every click
      const earningsPerClick = rewardAmount / threshold;
      const totalEarnings = totalClicks * earningsPerClick;
      
      console.log('\n💰 NEW EARNINGS CALCULATION:');
      console.log(`   📊 Earnings per click: ${earningsPerClick.toFixed(2)} ${currency}`);
      console.log(`   📈 Total clicks: ${totalClicks}`);
      console.log(`   💰 Total earnings: ${totalEarnings.toFixed(2)} ${currency}`);
      
      // Show earnings at different milestones
      console.log('\n🔮 Earnings at Milestones (NEW CALCULATION):');
      const milestones = [10, 25, 50, 100, 250, 500, 750, 1000];
      
      milestones.forEach(milestone => {
        const earningsAtMilestone = milestone * earningsPerClick;
        const progressAtMilestone = (milestone / threshold) * 100;
        
        console.log(`   ${milestone} clicks: ${earningsAtMilestone.toFixed(2)} ${currency} (${progressAtMilestone.toFixed(1)}% progress)`);
        
        if (milestone === totalClicks) {
          console.log(`     ⭐ CURRENT POSITION`);
        } else if (milestone > totalClicks) {
          const clicksNeeded = milestone - totalClicks;
          const earningsNeeded = clicksNeeded * earningsPerClick;
          console.log(`     📈 Need ${clicksNeeded} more clicks (+${earningsNeeded.toFixed(2)} ${currency})`);
        }
        console.log('');
      });
      
      // Compare old vs new calculation
      console.log('📊 COMPARISON: Old vs New Calculation');
      console.log('   OLD (threshold only):');
      const oldRewards = Math.floor(totalClicks / threshold);
      const oldEarnings = oldRewards * rewardAmount;
      console.log(`     - Rewards earned: ${oldRewards}`);
      console.log(`     - Earnings: ${oldEarnings} ${currency}`);
      
      console.log('   NEW (every click):');
      console.log(`     - Earnings per click: ${earningsPerClick.toFixed(2)} ${currency}`);
      console.log(`     - Total earnings: ${totalEarnings.toFixed(2)} ${currency}`);
      console.log(`     - Difference: +${(totalEarnings - oldEarnings).toFixed(2)} ${currency}`);
      
    } else {
      console.log('❌ No rewards configured');
    }
    
    // Step 5: Test API earnings
    console.log('\n5️⃣ Testing API earnings endpoint:');
    const earningsResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 API response:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEarningsNoThreshold(); 