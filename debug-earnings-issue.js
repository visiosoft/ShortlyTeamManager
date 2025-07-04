const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugEarningsIssue() {
  try {
    console.log('🔍 Debugging earnings issue for adnan@yahoo.com...\n');
    
    // Step 1: Login as adnan@yahoo.com
    console.log('1️⃣ Logging in as adnan@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('👤 User info:', {
      id: user.id,
      email: user.email,
      teamId: user.teamId,
      role: user.role
    });
    
    // Step 2: Get team info
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const team = teamResponse.data;
    console.log('🏢 Team info:', {
      id: team._id,
      name: team.name,
      rewards: team.rewards || 'No rewards configured'
    });
    
    // Step 3: Get user's URLs and total clicks
    console.log('\n3️⃣ Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const urls = urlsResponse.data.urls;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    console.log('🔗 URLs found:', urls.length);
    urls.forEach(url => {
      console.log(`   - ${url.shortCode}: ${url.clicks} clicks`);
    });
    console.log(`📊 Total clicks: ${totalClicks}`);
    
    // Step 4: Check earnings
    console.log('\n4️⃣ Checking earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('💰 Earnings result:', earningsResponse.data);
    
    // Step 5: Manual calculation for comparison
    console.log('\n5️⃣ Manual calculation:');
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
      
      console.log(`   Expected earnings: ${manualEarnings} ${team.rewards[0]?.currency || 'PKR'}`);
      console.log(`   Breakdown:`, breakdown);
    } else {
      console.log('   ❌ No rewards configured for this team');
      console.log('   💡 Admin needs to set up reward tiers in the rewards page');
    }
    
    // Step 6: Check if user is admin and can set rewards
    if (user.role === 'admin') {
      console.log('\n6️⃣ User is admin - can set up rewards');
      console.log('   💡 Go to /rewards page to configure reward tiers');
    } else {
      console.log('\n6️⃣ User is not admin - needs admin to set up rewards');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugEarningsIssue(); 