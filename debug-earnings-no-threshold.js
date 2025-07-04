const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugEarningsNoThreshold() {
  try {
    console.log('🔍 Debugging earnings WITHOUT threshold (1 click = X amount)...\n');
    
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
    
    // Step 3: Simulate earnings calculation WITHOUT threshold
    console.log('\n3️⃣ Simulating earnings WITHOUT threshold (1 click = X amount)...');
    const totalClicks = 15; // From analytics
    
    // Simulate different reward amounts per click
    const testRewards = [
      { amount: 1, currency: 'PKR', description: '1 PKR per click' },
      { amount: 5, currency: 'PKR', description: '5 PKR per click' },
      { amount: 10, currency: 'PKR', description: '10 PKR per click' },
      { amount: 20, currency: 'PKR', description: '20 PKR per click' },
      { amount: 50, currency: 'PKR', description: '50 PKR per click' }
    ];
    
    console.log(`📊 User has ${totalClicks} clicks`);
    console.log('💰 Earnings with different rates (NO THRESHOLD):\n');
    
    testRewards.forEach((reward, index) => {
      const earnings = totalClicks * reward.amount;
      console.log(`${index + 1}. ${reward.description}:`);
      console.log(`   - ${totalClicks} clicks × ${reward.amount} PKR = ${earnings} PKR`);
      console.log(`   - At 100 clicks: ${100 * reward.amount} PKR`);
      console.log(`   - At 1000 clicks: ${1000 * reward.amount} PKR`);
      console.log('');
    });
    
    // Step 4: Show current API earnings (with threshold)
    console.log('4️⃣ Current API earnings (WITH threshold):');
    const earningsResponse = await axios.get(`${BASE_URL}/api/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Current API response:', earningsResponse.data);
    
    if (team.rewards && team.rewards.length > 0) {
      const currentReward = team.rewards[0];
      console.log(`📋 Current threshold: ${currentReward.clicks} clicks = ${currentReward.amount} ${currentReward.currency}`);
      console.log(`💡 To earn: Need ${currentReward.clicks - totalClicks} more clicks`);
    }
    
    // Step 5: Comparison
    console.log('\n5️⃣ Comparison:');
    console.log('🔴 WITH threshold (current):');
    console.log('   - User needs to reach threshold to earn');
    console.log('   - No earnings until threshold is met');
    console.log('   - Example: 1000 clicks = 303 PKR');
    
    console.log('\n🟢 WITHOUT threshold (proposed):');
    console.log('   - Every click earns immediately');
    console.log('   - No minimum requirement');
    console.log('   - Example: 1 click = 5 PKR');
    console.log(`   - With ${totalClicks} clicks: ${totalClicks * 5} PKR`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugEarningsNoThreshold(); 