const axios = require('axios');

const BASE_URL = 'http://localhost:3009';
const FRONTEND_URL = 'http://localhost:3000';

async function testPredictedEarningsFrontend() {
  try {
    console.log('🔍 Testing predicted earnings frontend...\n');
    
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
    console.log('💰 Rewards:', team.rewards);
    
    // Step 3: Get current clicks
    console.log('\n3️⃣ Getting current clicks...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const totalClicks = analyticsResponse.data.totalClicks;
    console.log(`📊 Current clicks: ${totalClicks}`);
    
    // Step 4: Calculate predicted earnings manually
    console.log('\n4️⃣ Calculating predicted earnings...');
    if (team.rewards && team.rewards.length > 0) {
      const reward = team.rewards[0];
      const threshold = reward.clicks;
      const rewardAmount = reward.amount;
      const currency = reward.currency;
      
      console.log(`📋 Threshold: ${threshold} clicks = ${rewardAmount} ${currency}`);
      
      // Calculate predictions
      const progress = (totalClicks / threshold) * 100;
      const currentRewards = Math.floor(totalClicks / threshold);
      const currentEarnings = currentRewards * rewardAmount;
      const remainingClicks = totalClicks % threshold;
      const clicksToNextReward = threshold - remainingClicks;
      
      console.log('\n💰 Predicted Earnings Summary:');
      console.log(`   📈 Progress: ${progress.toFixed(1)}%`);
      console.log(`   🎯 Current: ${totalClicks} / ${threshold} clicks`);
      console.log(`   ✅ Rewards earned: ${currentRewards}`);
      console.log(`   💰 Current earnings: ${currentEarnings} ${currency}`);
      console.log(`   📊 Remaining clicks: ${remainingClicks}`);
      console.log(`   🎯 Clicks to next reward: ${clicksToNextReward}`);
      
      // Show milestones
      console.log('\n🔮 Earnings at Milestones:');
      const milestones = [100, 250, 500, 750, 1000, 1500, 2000];
      milestones.forEach(milestone => {
        const rewardsAtMilestone = Math.floor(milestone / threshold);
        const earningsAtMilestone = rewardsAtMilestone * rewardAmount;
        const progressAtMilestone = (milestone / threshold) * 100;
        
        const status = milestone <= totalClicks ? '✅ ACHIEVED' : '📈 NEEDS MORE';
        console.log(`   ${milestone} clicks: ${earningsAtMilestone} ${currency} (${progressAtMilestone.toFixed(1)}%) - ${status}`);
      });
      
      // Time projections
      console.log('\n⏰ Time to Next Reward:');
      const dailyRates = [5, 10, 20];
      dailyRates.forEach(rate => {
        const days = Math.ceil(clicksToNextReward / rate);
        console.log(`   At ${rate} clicks/day: ${days} days`);
      });
      
    } else {
      console.log('❌ No rewards configured');
    }
    
    // Step 5: Test frontend URL
    console.log('\n5️⃣ Frontend URL:');
    console.log(`   🌐 Visit: ${FRONTEND_URL}/my-clicks`);
    console.log('   📱 Check the "Predicted Earnings" section');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPredictedEarningsFrontend(); 