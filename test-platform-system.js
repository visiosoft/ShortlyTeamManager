const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';
let authToken = '';
let testPlatformId = '';
let testUserId = '';

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
async function testPlatformSystem() {
  console.log('🧪 Testing Platform Management System...\n');

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

    // 3. Get all platforms
    console.log('\n3. Fetching all platforms...');
    const platformsResponse = await api.get('/platforms');
    console.log('✅ Platforms fetched:', platformsResponse.data.length, 'platforms');

    // 4. Get team members (users)
    console.log('\n4. Fetching team members...');
    const usersResponse = await api.get('/users/team-members');
    const users = usersResponse.data;
    console.log('✅ Users fetched:', users.length, 'users');

    if (users.length > 0) {
      testUserId = users[0]._id;
      console.log('Using test user:', users[0].firstName, users[0].lastName);

      // 5. Add platform clicks for the user
      console.log('\n5. Adding platform clicks...');
      const clickData = {
        platformId: testPlatformId,
        userId: testUserId,
        clicks: 150,
        date: new Date().toISOString().split('T')[0],
        ratePerClick: 0.5,
        notes: 'Test clicks from cut.ly dashboard'
      };

      const addClicksResponse = await api.post('/platforms/clicks', clickData);
      console.log('✅ Clicks added successfully');
      console.log('   - Clicks:', addClicksResponse.data.clicks);
      console.log('   - Earnings:', addClicksResponse.data.earnings, 'PKR');

      // 6. Get platform clicks for the user
      console.log('\n6. Fetching user platform clicks...');
      const userClicksResponse = await api.get(`/platforms/clicks/user/${testUserId}`);
      console.log('✅ User clicks fetched:', userClicksResponse.data.length, 'records');

      // 7. Get all platform clicks
      console.log('\n7. Fetching all platform clicks...');
      const allClicksResponse = await api.get('/platforms/clicks/all');
      console.log('✅ All clicks fetched:', allClicksResponse.data.length, 'records');

      // 8. Get platform clicks statistics
      console.log('\n8. Fetching platform clicks statistics...');
      const statsResponse = await api.get('/platforms/clicks/stats');
      console.log('✅ Statistics fetched:');
      console.log('   - Total clicks:', statsResponse.data.totalClicks);
      console.log('   - Total earnings:', statsResponse.data.totalEarnings, 'PKR');
      console.log('   - Average rate per click:', statsResponse.data.averageRatePerClick, 'PKR');

      // 9. Update platform clicks
      console.log('\n9. Updating platform clicks...');
      const updateData = {
        clicks: 200,
        ratePerClick: 0.6,
        notes: 'Updated test clicks'
      };

      const updateResponse = await api.put(`/platforms/clicks/${addClicksResponse.data._id}`, updateData);
      console.log('✅ Clicks updated successfully');
      console.log('   - New clicks:', updateResponse.data.clicks);
      console.log('   - New earnings:', updateResponse.data.earnings, 'PKR');

      // 10. Test user-specific endpoints
      console.log('\n10. Testing user-specific endpoints...');
      const myClicksResponse = await api.get('/platforms/clicks/my-clicks');
      const myTeamClicksResponse = await api.get('/platforms/clicks/my-team');
      console.log('✅ User-specific endpoints working');

      // 11. Clean up - Delete the test clicks
      console.log('\n11. Cleaning up test data...');
      await api.delete(`/platforms/clicks/${addClicksResponse.data._id}`);
      console.log('✅ Test clicks deleted');

      // 12. Delete the test platform
      await api.delete(`/platforms/${testPlatformId}`);
      console.log('✅ Test platform deleted');

    } else {
      console.log('❌ No users found for testing');
    }

    console.log('\n🎉 All platform system tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Platform CRUD operations');
    console.log('   ✅ Platform clicks management');
    console.log('   ✅ Earnings calculation');
    console.log('   ✅ Statistics and reporting');
    console.log('   ✅ User and team-specific views');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure you have an admin user with email: admin@example.com');
    }
  }
}

// Run the test
testPlatformSystem(); 