const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEarnings() {
  try {
    // Step 1: Register a new user
    console.log('🔍 Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      teamName: 'Test Team',
      teamDescription: 'Test team for earnings'
    });
    
    const token = registerResponse.data.access_token;
    console.log('✅ Registration successful');
    
    // Step 2: Get team info
    console.log('🔍 Getting team info...');
    const teamResponse = await axios.get(`${BASE_URL}/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Team info:', teamResponse.data);
    
    // Step 3: Set up rewards
    console.log('🔍 Setting up rewards...');
    const rewardsResponse = await axios.post(`${BASE_URL}/teams/${teamResponse.data._id}/rewards`, {
      rewards: [
        { clicks: 10, amount: 5, currency: 'PKR' },
        { clicks: 50, amount: 25, currency: 'PKR' },
        { clicks: 100, amount: 60, currency: 'PKR' }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Rewards set up:', rewardsResponse.data);
    
    // Step 4: Create some URLs
    console.log('🔍 Creating URLs...');
    const url1Response = await axios.post(`${BASE_URL}/api/urls`, {
      originalUrl: 'https://google.com',
      customShortCode: 'test1'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const url2Response = await axios.post(`${BASE_URL}/api/urls`, {
      originalUrl: 'https://github.com',
      customShortCode: 'test2'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ URLs created');
    
    // Step 5: Simulate some clicks (we'll need to manually update the database)
    console.log('🔍 Note: To test earnings, you need to manually add clicks to URLs in the database');
    
    // Step 6: Check earnings (should be 0 initially)
    console.log('🔍 Checking earnings...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Earnings:', earningsResponse.data);
    
    // Step 7: Get user URLs to see current click counts
    console.log('🔍 Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ User URLs:', urlsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEarnings(); 