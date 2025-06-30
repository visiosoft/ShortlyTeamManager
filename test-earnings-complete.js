const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEarningsComplete() {
  try {
    console.log('🔍 Testing complete earnings flow...\n');
    
    // Step 1: Register a new admin user
    console.log('1️⃣ Registering admin user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      teamName: 'Test Team',
      teamDescription: 'Test team for earnings'
    });
    
    const adminToken = registerResponse.data.access_token;
    const adminUser = registerResponse.data.user;
    console.log('✅ Admin registered:', adminUser.email, 'Team ID:', adminUser.teamId);
    
    // Step 2: Get team info
    console.log('\n2️⃣ Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const team = teamResponse.data;
    console.log('✅ Team info:', { 
      id: team._id, 
      name: team.name, 
      rewards: team.rewards || 'No rewards set' 
    });
    
    // Step 3: Set up rewards
    console.log('\n3️⃣ Setting up rewards...');
    const rewardsData = {
      rewards: [
        { clicks: 10, amount: 5, currency: 'PKR' },
        { clicks: 50, amount: 25, currency: 'PKR' },
        { clicks: 100, amount: 60, currency: 'PKR' },
        { clicks: 500, amount: 300, currency: 'PKR' }
      ]
    };
    
    const rewardsResponse = await axios.post(`${BASE_URL}/teams/${team._id}/rewards`, rewardsData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Rewards set up:', rewardsResponse.data.rewards);
    
    // Step 4: Create a URL to get some clicks
    console.log('\n4️⃣ Creating a test URL...');
    const urlResponse = await axios.post(`${BASE_URL}/api/urls`, {
      originalUrl: 'https://www.google.com',
      customShortCode: 'test123'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const url = urlResponse.data;
    console.log('✅ URL created:', url.shortUrl);
    
    // Step 5: Simulate some clicks (manually update clicks in database)
    console.log('\n5️⃣ Simulating clicks...');
    // We'll need to manually update the clicks in the database
    // For now, let's check earnings with 0 clicks
    
    // Step 6: Check earnings
    console.log('\n6️⃣ Checking earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Earnings result:', earningsResponse.data);
    
    // Step 7: Test with different click counts
    console.log('\n7️⃣ Testing with simulated clicks...');
    
    // Let's test the calculation logic directly
    const testClicks = [0, 5, 15, 75, 150, 600];
    
    for (const clicks of testClicks) {
      console.log(`\n📊 Testing with ${clicks} clicks:`);
      
      // Manually calculate expected earnings
      let expectedEarnings = 0;
      let breakdown = [];
      
      let remainingClicks = clicks;
      const sortedRewards = [...rewardsData.rewards].sort((a, b) => b.clicks - a.clicks);
      
      for (const reward of sortedRewards) {
        if (remainingClicks >= reward.clicks) {
          const rewardCount = Math.floor(remainingClicks / reward.clicks);
          const earnedAmount = rewardCount * reward.amount;
          
          breakdown.push({
            clicks: reward.clicks * rewardCount,
            amount: earnedAmount,
            currency: reward.currency
          });
          
          expectedEarnings += earnedAmount;
          remainingClicks = remainingClicks % reward.clicks;
        }
      }
      
      console.log(`   Expected earnings: ${expectedEarnings} PKR`);
      console.log(`   Breakdown:`, breakdown);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEarningsComplete(); 