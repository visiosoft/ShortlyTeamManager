const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugPredictedEarnings() {
  try {
    console.log('🔍 Debugging predicted earnings with threshold...\n');
    
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
    
    // Step 4: Calculate predicted earnings
    console.log('\n4️⃣ Calculating predicted earnings...');
    
    if (team.rewards && team.rewards.length > 0) {
      const reward = team.rewards[0];
      const threshold = reward.clicks;
      const rewardAmount = reward.amount;
      const currency = reward.currency;
      
      console.log(`📋 Reward threshold: ${threshold} clicks = ${rewardAmount} ${currency}`);
      
      // Calculate current progress
      const progress = (totalClicks / threshold) * 100;
      const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
      
      console.log(`📈 Progress: ${progress.toFixed(1)}% [${progressBar}]`);
      console.log(`🎯 Current: ${totalClicks} / ${threshold} clicks`);
      
      // Calculate earnings scenarios
      const currentRewards = Math.floor(totalClicks / threshold);
      const currentEarnings = currentRewards * rewardAmount;
      const remainingClicks = totalClicks % threshold;
      const clicksToNextReward = threshold - remainingClicks;
      
      console.log('\n💰 Earnings Analysis:');
      console.log(`   ✅ Rewards earned: ${currentRewards}`);
      console.log(`   💰 Current earnings: ${currentEarnings} ${currency}`);
      console.log(`   📊 Remaining clicks: ${remainingClicks}`);
      console.log(`   🎯 Clicks to next reward: ${clicksToNextReward}`);
      
      // Show predicted earnings at different milestones
      console.log('\n🔮 Predicted Earnings:');
      const milestones = [100, 250, 500, 750, 1000, 1500, 2000];
      
      milestones.forEach(milestone => {
        const rewardsAtMilestone = Math.floor(milestone / threshold);
        const earningsAtMilestone = rewardsAtMilestone * rewardAmount;
        const progressAtMilestone = (milestone / threshold) * 100;
        
        console.log(`   At ${milestone} clicks:`);
        console.log(`     - Progress: ${progressAtMilestone.toFixed(1)}%`);
        console.log(`     - Rewards: ${rewardsAtMilestone}`);
        console.log(`     - Earnings: ${earningsAtMilestone} ${currency}`);
        
        if (milestone === totalClicks) {
          console.log(`     ⭐ CURRENT POSITION`);
        } else if (milestone > totalClicks) {
          const clicksNeeded = milestone - totalClicks;
          console.log(`     📈 Need ${clicksNeeded} more clicks`);
        }
        console.log('');
      });
      
      // Show what happens if they continue at current rate
      console.log('📊 Projections (if current rate continues):');
      const dailyClicks = 5; // Assume 5 clicks per day
      const weeklyClicks = dailyClicks * 7;
      const monthlyClicks = dailyClicks * 30;
      
      console.log(`   📅 Daily rate: ${dailyClicks} clicks`);
      console.log(`   📅 Weekly rate: ${weeklyClicks} clicks`);
      console.log(`   📅 Monthly rate: ${monthlyClicks} clicks`);
      
      const daysToNextReward = Math.ceil(clicksToNextReward / dailyClicks);
      const weeksToNextReward = Math.ceil(clicksToNextReward / weeklyClicks);
      
      console.log(`   ⏰ Days to next reward: ${daysToNextReward}`);
      console.log(`   ⏰ Weeks to next reward: ${weeksToNextReward}`);
      
    } else {
      console.log('❌ No rewards configured');
    }
    
    // Step 5: Show current API earnings
    console.log('\n5️⃣ Current API earnings:');
    const earningsResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 API response:', earningsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugPredictedEarnings(); 