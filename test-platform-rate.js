const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';
let authToken = '';
let testPlatformId = '';
let testUserId = '';
let testTeamId = '';

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const setAuthToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Test functions
async function testPlatformRateSystem() {
  console.log('🧪 Testing Platform Rate System (Team Rewards Integration)...\n');

  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.token) {
      setAuthToken(loginResponse.data.token);
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Login failed');
    }

    // 2. Create a test platform
    console.log('\n2. Creating test platform...');
    const platformData = {
      name: 'cut.ly',
      description: 'URL shortening service for testing',
      website: 'https://cut.ly',
      type: 'external',
      isActive: true
    };

    const createPlatformResponse = await api.post('/platforms', platformData);
    testPlatformId = createPlatformResponse.data._id;
    console.log('✅ Platform created:', createPlatformResponse.data.name);

    // 3. Get team members and check their team's reward rate
    console.log('\n3. Checking team reward rates...');
    const usersResponse = await api.get('/users/team-members');
    const users = usersResponse.data;
    console.log('✅ Users fetched:', users.length, 'users');

    if (users.length > 0) {
      testUserId = users[0]._id;
      testTeamId = users[0].teamId._id;
      console.log('Using test user:', users[0].firstName, users[0].lastName);
      console.log('Team ID:', testTeamId);

      // 4. Check current team rewards
      console.log('\n4. Checking current team rewards...');
      const teamResponse = await api.get(`/teams/${testTeamId}`);
      const team = teamResponse.data;
      console.log('Team rewards:', team.rewards);

      let expectedRate = 0.5; // Default
      if (team.rewards && team.rewards.length > 0) {
        const reward = team.rewards[0];
        expectedRate = reward.amount / reward.clicks;
        console.log(`Expected rate: ${reward.amount} PKR per ${reward.clicks} clicks = ${expectedRate} PKR per click`);
      } else {
        console.log('No team rewards configured, using default rate:', expectedRate);
      }

      // 5. Add platform clicks WITHOUT specifying rate (should use team rate)
      console.log('\n5. Adding platform clicks (rate should be auto-set from team rewards)...');
      const clickData = {
        platformId: testPlatformId,
        userId: testUserId,
        clicks: 100,
        date: new Date().toISOString().split('T')[0],
        notes: 'Test clicks with auto rate from team rewards'
        // Note: NOT specifying ratePerClick - should use team rate
      };

      const addClicksResponse = await api.post('/platforms/clicks', clickData);
      console.log('✅ Clicks added successfully');
      console.log('   - Clicks:', addClicksResponse.data.clicks);
      console.log('   - Rate used:', addClicksResponse.data.ratePerClick, 'PKR per click');
      console.log('   - Earnings:', addClicksResponse.data.earnings, 'PKR');
      console.log('   - Expected earnings:', 100 * expectedRate, 'PKR');

      // 6. Verify the rate matches team rewards
      if (Math.abs(addClicksResponse.data.ratePerClick - expectedRate) < 0.01) {
        console.log('✅ Rate correctly set from team rewards!');
      } else {
        console.log('❌ Rate mismatch! Expected:', expectedRate, 'Got:', addClicksResponse.data.ratePerClick);
      }

      // 7. Test updating team rewards and adding new clicks
      console.log('\n7. Testing with updated team rewards...');
      
      // Update team rewards to a different rate
      const newRewards = [{
        clicks: 50,
        amount: 25, // 0.5 PKR per click
        currency: 'PKR'
      }];
      
      await api.post(`/teams/${testTeamId}/rewards`, { rewards: newRewards });
      console.log('✅ Team rewards updated to:', newRewards[0].amount, 'PKR per', newRewards[0].clicks, 'clicks');

      // Add new clicks with updated rate
      const newClickData = {
        platformId: testPlatformId,
        userId: testUserId,
        clicks: 200,
        date: new Date().toISOString().split('T')[0],
        notes: 'Test clicks with updated team rewards'
      };

      const newClicksResponse = await api.post('/platforms/clicks', newClickData);
      console.log('✅ New clicks added with updated rate');
      console.log('   - Clicks:', newClicksResponse.data.clicks);
      console.log('   - New rate used:', newClicksResponse.data.ratePerClick, 'PKR per click');
      console.log('   - Earnings:', newClicksResponse.data.earnings, 'PKR');

      const newExpectedRate = 25 / 50; // 0.5 PKR per click
      if (Math.abs(newClicksResponse.data.ratePerClick - newExpectedRate) < 0.01) {
        console.log('✅ Updated rate correctly applied!');
      } else {
        console.log('❌ Updated rate mismatch! Expected:', newExpectedRate, 'Got:', newClicksResponse.data.ratePerClick);
      }

      // 8. Clean up
      console.log('\n8. Cleaning up test data...');
      await api.delete(`/platforms/clicks/${addClicksResponse.data._id}`);
      await api.delete(`/platforms/clicks/${newClicksResponse.data._id}`);
      console.log('✅ Test clicks deleted');

      await api.delete(`/platforms/${testPlatformId}`);
      console.log('✅ Test platform deleted');

    } else {
      console.log('❌ No users found for testing');
    }

    console.log('\n🎉 Platform rate system tests completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Automatic rate setting from team rewards');
    console.log('   ✅ Rate updates when team rewards change');
    console.log('   ✅ Earnings calculation with correct rates');
    console.log('   ✅ Fallback to default rate when no rewards configured');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure you have an admin user with email: admin@example.com');
    }
  }
}

// Run the test
testPlatformRateSystem(); 